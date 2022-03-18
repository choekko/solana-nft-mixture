export type MixtureMachine = {
  "version": "0.1.0",
  "name": "mixture_machine",
  "instructions": [
    {
      "name": "composeNft",
      "accounts": [
        {
          "name": "mixtureMachine",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mixtureMachineCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "decomposeNft",
      "accounts": [
        {
          "name": "mixtureMachine",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mixtureMachineCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentTokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentBurnAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeMixtureMachine",
      "accounts": [
        {
          "name": "mixtureMachine",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "MixtureMachineData"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "mixtureMachine",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "data",
            "type": {
              "defined": "MixtureMachineData"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MixtureMachineData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uuid",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "Creator"
              }
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "Creator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "share",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ChildrenAuthorityMissing",
      "msg": "Missing children NFT transfer authority when required"
    },
    {
      "code": 6001,
      "name": "IncorrectOwner",
      "msg": "Account does not have correct owner!"
    },
    {
      "code": 6002,
      "name": "Uninitialized",
      "msg": "Account is not initialized!"
    },
    {
      "code": 6003,
      "name": "NumericalOverflowError",
      "msg": "Numerical overflow error!"
    },
    {
      "code": 6004,
      "name": "TooManyCreators",
      "msg": "Can only provide up to 4 creators to mixture machine (because mixture machine is one)!"
    },
    {
      "code": 6005,
      "name": "UuidMustBeExactly6Length",
      "msg": "Uuid must be exactly of 6 length"
    },
    {
      "code": 6006,
      "name": "NotEnoughTokens",
      "msg": "Not enough tokens to pay for this minting"
    },
    {
      "code": 6007,
      "name": "TokenTransferFailed",
      "msg": "Token transfer failed"
    },
    {
      "code": 6008,
      "name": "DerivedKeyInvalid",
      "msg": "Derived key invalid"
    },
    {
      "code": 6009,
      "name": "PublicKeyMismatch",
      "msg": "Public key mismatch"
    },
    {
      "code": 6010,
      "name": "TokenBurnFailed",
      "msg": "Token burn failed"
    },
    {
      "code": 6011,
      "name": "SuspiciousTransaction",
      "msg": "Suspicious transaction detected"
    },
    {
      "code": 6012,
      "name": "IncorrectSlotHashesPubkey",
      "msg": "Incorrect SlotHashes PubKey"
    }
  ]
};

export const IDL: MixtureMachine = {
  "version": "0.1.0",
  "name": "mixture_machine",
  "instructions": [
    {
      "name": "composeNft",
      "accounts": [
        {
          "name": "mixtureMachine",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mixtureMachineCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "updateAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "decomposeNft",
      "accounts": [
        {
          "name": "mixtureMachine",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mixtureMachineCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentTokenMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentBurnAuthority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recentBlockhashes",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeMixtureMachine",
      "accounts": [
        {
          "name": "mixtureMachine",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "MixtureMachineData"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "mixtureMachine",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "data",
            "type": {
              "defined": "MixtureMachineData"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MixtureMachineData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uuid",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "Creator"
              }
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "Creator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "share",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ChildrenAuthorityMissing",
      "msg": "Missing children NFT transfer authority when required"
    },
    {
      "code": 6001,
      "name": "IncorrectOwner",
      "msg": "Account does not have correct owner!"
    },
    {
      "code": 6002,
      "name": "Uninitialized",
      "msg": "Account is not initialized!"
    },
    {
      "code": 6003,
      "name": "NumericalOverflowError",
      "msg": "Numerical overflow error!"
    },
    {
      "code": 6004,
      "name": "TooManyCreators",
      "msg": "Can only provide up to 4 creators to mixture machine (because mixture machine is one)!"
    },
    {
      "code": 6005,
      "name": "UuidMustBeExactly6Length",
      "msg": "Uuid must be exactly of 6 length"
    },
    {
      "code": 6006,
      "name": "NotEnoughTokens",
      "msg": "Not enough tokens to pay for this minting"
    },
    {
      "code": 6007,
      "name": "TokenTransferFailed",
      "msg": "Token transfer failed"
    },
    {
      "code": 6008,
      "name": "DerivedKeyInvalid",
      "msg": "Derived key invalid"
    },
    {
      "code": 6009,
      "name": "PublicKeyMismatch",
      "msg": "Public key mismatch"
    },
    {
      "code": 6010,
      "name": "TokenBurnFailed",
      "msg": "Token burn failed"
    },
    {
      "code": 6011,
      "name": "SuspiciousTransaction",
      "msg": "Suspicious transaction detected"
    },
    {
      "code": 6012,
      "name": "IncorrectSlotHashesPubkey",
      "msg": "Incorrect SlotHashes PubKey"
    }
  ]
};
