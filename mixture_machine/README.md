# Mixture_machine
## Core logic of composing NFT
![image](https://user-images.githubusercontent.com/96561121/158933209-1c7294c2-844a-4ad8-ad59-91819073d492.png)

* Compose of NFT   
As you invoke compose_nft function with 2 or more child NFTs,   
child NFTs are locked in to Mixture Program owned vault, and parent NFT will be minted.   
This parent NFT contains informations of child NFT on its on-chain metadata and off-chain metadata either.   
   
* Decompose of NFT   
As you invoke decompose_nft function with parent NFT,   
parernt NFT burned, and child NFTs will be returned.   
   
* On-chain Metadata   
You can get address of the vault which contains child NFTs, the owner PDA of vaults, seeds used to find owner PDA from on-chain metadata.   
By combination of those data, you can deduce authority seeds.   
   
## Future Usage
* You can use mixture machine to compose two or more hetero NFTs, NFTs which are made by different teams.   
* You can also use it to decorate your NFT by patching sticker or badge NFTs.   
* You cna use it to wrap your NFTs by single input.   
   
## Acknowledgements and inspiration
* [Metaplex's candymachine](https://docs.metaplex.com/)
