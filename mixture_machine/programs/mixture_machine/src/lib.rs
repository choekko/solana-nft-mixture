pub mod utils;

use {
    crate::utils::{
        assert_is_ata, assert_owned_by, //assert_initialized, assert_keys_equal,
        spl_token_transfer, TokenTransferParams, spl_token_burn, TokenBurnParams,
    },
    anchor_lang::{
        prelude::*,
        solana_program::{
            log::sol_log_compute_units,
            program::invoke_signed,
            serialize_utils::{read_pubkey, read_u16},
            sysvar,
            pubkey::Pubkey,
        },
        AnchorDeserialize, AnchorSerialize, Discriminator, Key,
    },
    anchor_spl::token::Token,
    mpl_token_metadata::{
        instruction::create_metadata_accounts,
        state::{
            MAX_CREATOR_LIMIT, MAX_SYMBOL_LENGTH,
        },
    },
    std::str::FromStr,
};

declare_id!("7TzTuLobYxcPJw62EMEq93C72vBd8tmRP8CbQ7e4tS3z");

const PREFIX: &str = "mixture_machine";
const BLOCK_HASHES: &str = "SysvarRecentB1ockHashes11111111111111111111";
#[program]
pub mod mixture_machine {

    use super::*;

    pub fn compose_nft<'info>(
        ctx: Context<'_, '_, '_, 'info, ComposeNFT<'info>>,
        creator_bump: u8,
    ) -> ProgramResult{
        let mixture_machine = &mut ctx.accounts.mixture_machine;
        let mixture_machine_creator = &ctx.accounts.mixture_machine_creator;
        let payer = &ctx.accounts.payer;
        let token_program = &ctx.accounts.token_program;
        //Account name the same for IDL compatability
        let recent_slothashes = &ctx.accounts.recent_blockhashes;
        let instruction_sysvar_account = &ctx.accounts.instruction_sysvar_account;

        if recent_slothashes.key().to_string() == BLOCK_HASHES {
            msg!("recent_blockhashes is deprecated and will break soon");
        }
        if recent_slothashes.key() != sysvar::slot_hashes::id()
            && recent_slothashes.key().to_string() != BLOCK_HASHES
        {
            return Err(ErrorCode::IncorrectSlotHashesPubkey.into());
        }

        let mut remaining_accounts_counter: usize = 0;
        if ctx.remaining_accounts.len() <= remaining_accounts_counter {
            return Err(ErrorCode::ChildrenAuthorityMissing.into());
        }

        // total number of child NFTs.
        let children_number = ctx.remaining_accounts.len() / 4; // 나중에 checked_div로 바꿔주기

        // order of remaining accounts: child transfer authority - child mint - child ata - child vault
        for _i in 0..children_number {
            // child NFT transfer authority
            let child_authority_info = &ctx.remaining_accounts[remaining_accounts_counter];
            remaining_accounts_counter += 1;
            // mint account of child NFT
            let child_mint = &ctx.remaining_accounts[remaining_accounts_counter];
            remaining_accounts_counter += 1;
            // minter's ata of child NFT
            let child_ata_info = &ctx.remaining_accounts[remaining_accounts_counter];
            remaining_accounts_counter += 1;
            // program's vault pda of child NFT
            let child_vault_info = &ctx.remaining_accounts[remaining_accounts_counter];
            remaining_accounts_counter += 1;

            let child_ata = assert_is_ata(child_ata_info, &payer.key(), &child_mint.key)?;        
            
            // transferring ownership of child NFT (NFT minter -> Mixture PDA)
            if child_ata.amount < 1 {
                return Err(ErrorCode::NotEnoughTokens.into());
            }

            spl_token_transfer(TokenTransferParams {
                source: child_ata_info.clone(), 
                destination: child_vault_info.clone(),
                authority: child_authority_info.clone(),
                authority_signer_seeds: &[],
                token_program: token_program.to_account_info(),
                amount: 1,
            })?;
        }

        let mm_key = mixture_machine.key();
        let authority_seeds = [PREFIX.as_bytes(), mm_key.as_ref(), &[creator_bump]];

        // creators[0] = mixture_machine_creator, mixture machine's PDA & the owner of child NFT vault.
        let mut creators: Vec<mpl_token_metadata::state::Creator> =
            vec![mpl_token_metadata::state::Creator {
                address: mixture_machine_creator.key(),
                verified: true,
                share: 0,
            }];
        // creators[1] = mixture_machine, mixture machine's PDA & seed of mixture_machine_creator.
        creators.push(mpl_token_metadata::state::Creator {
            address: mixture_machine.key(),
            verified: false,
            share: 0,
        });

        for c in &mixture_machine.data.creators {
            creators.push(mpl_token_metadata::state::Creator {
                address: c.address,
                verified: false,
                share: c.share,
            });
        }

        let metadata_infos = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
            mixture_machine_creator.to_account_info(),
        ];

        msg!("Before metadata");
        sol_log_compute_units();

        invoke_signed(
            &create_metadata_accounts(
                *ctx.accounts.token_metadata_program.key,
                *ctx.accounts.metadata.key,
                *ctx.accounts.mint.key,
                *ctx.accounts.mint_authority.key,
                *ctx.accounts.payer.key,
                mixture_machine_creator.key(),
                mixture_machine.data.name.clone(),
                mixture_machine.data.symbol.clone(),
                mixture_machine.data.uri.clone(), 
                Some(creators),
                0,
                true,
                false,
            ),
            metadata_infos.as_slice(),
            &[&authority_seeds],
        )?;

        msg!("Before instr check");
        sol_log_compute_units();

        let instruction_sysvar_account_info = instruction_sysvar_account.to_account_info();

        let instruction_sysvar = instruction_sysvar_account_info.data.borrow();

        let mut idx = 0;
        let num_instructions = read_u16(&mut idx, &instruction_sysvar)
            .map_err(|_| ProgramError::InvalidAccountData)?;

        let associated_token =
            Pubkey::from_str("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL").unwrap();

        for index in 0..num_instructions {
            let mut current = 2 + (index * 2) as usize;
            let start = read_u16(&mut current, &instruction_sysvar).unwrap();

            current = start as usize;
            let num_accounts = read_u16(&mut current, &instruction_sysvar).unwrap();
            current += (num_accounts as usize) * (1 + 32);
            let program_id = read_pubkey(&mut current, &instruction_sysvar).unwrap();

            if program_id != mixture_machine::id()
                && program_id != spl_token::id()
                && program_id != anchor_lang::solana_program::system_program::ID
                && program_id != associated_token
            {
                msg!("Transaction had ix with program id {}", program_id);
                return Err(ErrorCode::SuspiciousTransaction.into());
            }
        }

        msg!("At the end");
        sol_log_compute_units();
        Ok(())
    }


    pub fn decompose_nft<'info>(
        ctx: Context<'_, '_, '_, 'info, DecomposeNFT<'info>>,
        creator_bump: u8,
    ) -> ProgramResult{
        // get mixture_machine PDA from parent NFT's metadata, in creators[1].
        let mixture_machine = &mut ctx.accounts.mixture_machine;
        // get mixture_machine_creator PDA from parent NFT's metadata, in creators[0].
        let mixture_machine_creator = &ctx.accounts.mixture_machine_creator;
        let token_program = &ctx.accounts.token_program;
        //Account name the same for IDL compatability
        let recent_slothashes = &ctx.accounts.recent_blockhashes;
        let instruction_sysvar_account = &ctx.accounts.instruction_sysvar_account;

        if recent_slothashes.key().to_string() == BLOCK_HASHES {
            msg!("recent_blockhashes is deprecated and will break soon");
        }
        if recent_slothashes.key() != sysvar::slot_hashes::id()
            && recent_slothashes.key().to_string() != BLOCK_HASHES
        {
            return Err(ErrorCode::IncorrectSlotHashesPubkey.into());
        }

        let mut remaining_accounts_counter: usize = 0;
        if ctx.remaining_accounts.len() <= remaining_accounts_counter {
            return Err(ErrorCode::ChildrenAuthorityMissing.into());
        }

        // total number of child NFTs.
        let children_number = ctx.remaining_accounts.len() / 2; // 나중에 checked_div로 바꿔주기

        let mm_key = mixture_machine.key();
        let authority_seeds = [PREFIX.as_bytes(), mm_key.as_ref(), &[creator_bump]];
        
        // order of remaining accounts: child ata - child vault
        for _i in 0..children_number {
            // user's ata of child NFT, for return.
            let child_ata_info = &ctx.remaining_accounts[remaining_accounts_counter];
            remaining_accounts_counter += 1;
            // ata of child NFT owned by "mixture_machine_creator PDA", get this from getTokenAccountsByOwner of "mixture_machine_creator PDA".
            let child_vault_info = &ctx.remaining_accounts[remaining_accounts_counter];
            remaining_accounts_counter += 1;

            // transfer child NFTs from vault to user's ata.
            let transfer_infos = vec![
                child_vault_info.clone(),
                child_ata_info.clone(),
                mixture_machine_creator.to_account_info(),
                token_program.to_account_info(),
            ];

            invoke_signed(
                &spl_token::instruction::transfer(
                    token_program.key,
                    child_vault_info.key,
                    child_ata_info.key,
                    &mixture_machine_creator.key(),
                    &[],
                    1,
                )?,
                transfer_infos.as_slice(),
                &[&authority_seeds],
            )?;
        }

        msg!("Before parent burn");
        sol_log_compute_units();

        // burn parent NFT.
        spl_token_burn(TokenBurnParams {
            mint: ctx.accounts.parent_token_mint.to_account_info(),
            source: ctx.accounts.parent_token_account.to_account_info(),
            amount: 1,
            authority: ctx.accounts.parent_burn_authority.to_account_info(),
            authority_signer_seeds: None,
            token_program: token_program.to_account_info(),
        })?;


        msg!("Before instr check");
        sol_log_compute_units();

        let instruction_sysvar_account_info = instruction_sysvar_account.to_account_info();

        let instruction_sysvar = instruction_sysvar_account_info.data.borrow();

        let mut idx = 0;
        let num_instructions = read_u16(&mut idx, &instruction_sysvar)
            .map_err(|_| ProgramError::InvalidAccountData)?;

        let associated_token =
            Pubkey::from_str("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL").unwrap();

        for index in 0..num_instructions {
            let mut current = 2 + (index * 2) as usize;
            let start = read_u16(&mut current, &instruction_sysvar).unwrap();

            current = start as usize;
            let num_accounts = read_u16(&mut current, &instruction_sysvar).unwrap();
            current += (num_accounts as usize) * (1 + 32);
            let program_id = read_pubkey(&mut current, &instruction_sysvar).unwrap();

            if program_id != mixture_machine::id()
                && program_id != spl_token::id()
                && program_id != anchor_lang::solana_program::system_program::ID
                && program_id != associated_token
            {
                msg!("Transaction had ix with program id {}", program_id);
                return Err(ErrorCode::SuspiciousTransaction.into());
            }
        }

        msg!("At the end");
        sol_log_compute_units();
        Ok(())
    }

    pub fn initialize_mixture_machine(
        ctx: Context<InitializeMixtureMachine>,
        data: MixtureMachineData,
    ) -> ProgramResult {
        let mixture_machine_account = &mut ctx.accounts.mixture_machine;

        if data.uuid.len() != 6 {
            return Err(ErrorCode::UuidMustBeExactly6Length.into());
        }

        let mut mixture_machine = MixtureMachine {
            data,
            authority: *ctx.accounts.authority.key,
        };

        let mut array_of_zeroes = vec![];
        while array_of_zeroes.len() < MAX_SYMBOL_LENGTH - mixture_machine.data.symbol.len() {
            array_of_zeroes.push(0u8);
        }
        let new_symbol =
            mixture_machine.data.symbol.clone() + std::str::from_utf8(&array_of_zeroes).unwrap();
        mixture_machine.data.symbol = new_symbol;

        // - 2 because we & mixture_machine PDA are going to be a creator
        if mixture_machine.data.creators.len() > MAX_CREATOR_LIMIT - 2 {
            return Err(ErrorCode::TooManyCreators.into());
        }

        let mut new_data = MixtureMachine::discriminator().try_to_vec().unwrap();
        new_data.append(&mut mixture_machine.try_to_vec().unwrap());
        let mut data = mixture_machine_account.data.borrow_mut();
        for i in 0..new_data.len() {
            data[i] = new_data[i];
        }

        Ok(())
    }
}


/// Create a new mixture machine.
#[derive(Accounts)]
#[instruction(data: MixtureMachineData)]
pub struct InitializeMixtureMachine<'info> {
    #[account(zero, rent_exempt = skip, constraint = mixture_machine.to_account_info().owner == program_id)]
    mixture_machine: UncheckedAccount<'info>,
    authority: UncheckedAccount<'info>,
    payer: Signer<'info>,
    system_program: Program<'info, System>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(creator_bump: u8)]
pub struct ComposeNFT<'info> {
    #[account(mut)]
    mixture_machine: Account<'info, MixtureMachine>,
    #[account(
        seeds=[PREFIX.as_bytes(), mixture_machine.key().as_ref()], bump=creator_bump
    )]
    mixture_machine_creator: UncheckedAccount<'info>,
    payer: Signer<'info>,
    // With the following accounts we aren't using anchor macros because they are CPI'd
    // through to token-metadata which will do all the validations we need on them.
    #[account(mut)]
    metadata: UncheckedAccount<'info>,
    // Parent NFT's token mint account with no metadata
    #[account(mut)]
    mint: UncheckedAccount<'info>,
    mint_authority: Signer<'info>,
    update_authority: Signer<'info>, // delete this in future.
    #[account(address = mpl_token_metadata::id())]
    token_metadata_program: UncheckedAccount<'info>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
    rent: Sysvar<'info, Rent>,
    recent_blockhashes: UncheckedAccount<'info>,
    #[account(address = sysvar::instructions::id())]
    instruction_sysvar_account: UncheckedAccount<'info>,
}


#[derive(Accounts)]
#[instruction(creator_bump: u8)]
pub struct DecomposeNFT<'info> {
    // get mixture_machine PDA from parent NFT's metadata, in creators[1].
    #[account(mut)]
    mixture_machine: Account<'info, MixtureMachine>,
    #[account(
        seeds=[PREFIX.as_bytes(), mixture_machine.key().as_ref()], bump=creator_bump
    )]
    mixture_machine_creator: UncheckedAccount<'info>,
    #[account(mut)]
    parent_token_mint: UncheckedAccount<'info>,
    #[account(mut)]
    parent_token_account: UncheckedAccount<'info>,
    parent_burn_authority: Signer<'info>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
    rent: Sysvar<'info, Rent>,
    recent_blockhashes: UncheckedAccount<'info>,
    #[account(address = sysvar::instructions::id())]
    instruction_sysvar_account: UncheckedAccount<'info>,
}

/// Mixture machine state and config data.
#[account]
#[derive(Default)]
pub struct MixtureMachine {
    pub authority: Pubkey,
    pub data: MixtureMachineData,
    // there's a borsh vec u32 denoting how many actual lines of data there are currently (eventually equals items available)
    // There is actually lines and lines of data after this but we explicitly never want them deserialized.
    // here there is a borsh vec u32 indicating number of bytes in bitmask array.
    // here there is a number of bytes equal to ceil(max_number_of_lines/8) and it is a bit mask used to figure out when to increment borsh vec u32
}

/// Mixture machine settings data.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct MixtureMachineData {
    pub uuid: String,
    /// The symbol for the asset
    pub symbol: String,
    pub creators: Vec<Creator>,
    pub name: String,
    pub uri: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,
}

#[error]
pub enum ErrorCode {
    #[msg("Missing children NFT transfer authority when required")]
    ChildrenAuthorityMissing,
    #[msg("Account does not have correct owner!")]
    IncorrectOwner,
    #[msg("Account is not initialized!")]
    Uninitialized,
    #[msg("Numerical overflow error!")]
    NumericalOverflowError,
    #[msg("Can only provide up to 4 creators to mixture machine (because mixture machine is one)!")]
    TooManyCreators,
    #[msg("Uuid must be exactly of 6 length")]
    UuidMustBeExactly6Length,
    #[msg("Not enough tokens to pay for this minting")]
    NotEnoughTokens,
    #[msg("Token transfer failed")]
    TokenTransferFailed,
    #[msg("Derived key invalid")]
    DerivedKeyInvalid,
    #[msg("Public key mismatch")]
    PublicKeyMismatch,
    #[msg("Token burn failed")]
    TokenBurnFailed,
    #[msg("Suspicious transaction detected")]
    SuspiciousTransaction,
    #[msg("Incorrect SlotHashes PubKey")]
    IncorrectSlotHashesPubkey,
}
