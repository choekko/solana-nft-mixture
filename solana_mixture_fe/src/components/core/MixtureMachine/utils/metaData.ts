import * as anchor from '@project-serum/anchor';
import _ from 'underscore';
import { Attributes } from 'utils/metadata';

interface MakeParentMetaDataJsonParam {
  imageNumber: number;
  payer: anchor.web3.PublicKey;
  parentNftMint: anchor.web3.PublicKey;
  childNftMints: anchor.web3.PublicKey[];
  childrenAttributes: Attributes;
  network?: string;
}

export type Element = 'Yoko' | 'Fitz' | 'Gokal' | 'Levy' | 'Willi' | 'Garg';

const ElementMap = {
  Yoko: 1,
  Fitz: 2,
  Gokal: 3,
  Levy: 4,
  Willi: 5,
  Garg: 6,
} as const;

export const calculateImageNumber = (elementTwin: [Element, Element]): number => {
  const mixtureNumberMap = [
    [
      [2, 4],
      [4, 5],
      [1, 6],
      [2, 3],
      [1, 2],
    ],
    [
      [3, 4],
      [2, 5],
      [1, 3],
      [5, 6],
      [2, 6],
    ],
    [
      [3, 6],
      [4, 6],
      [1, 5],
      [1, 4],
      [3, 5],
    ],
  ];

  const elementNumberTwin = [ElementMap[elementTwin[0]], ElementMap[elementTwin[1]]];

  return (
    1 +
    mixtureNumberMap.findIndex(twinList =>
      twinList.some(candidateTwin => {
        return _.intersection(candidateTwin, elementNumberTwin).length === 2;
      }),
    )
  );
};

export const makeParentMetaData = ({
  imageNumber,
  payer,
  parentNftMint,
  childNftMints,
  childrenAttributes,
  network = 'devnet',
}: MakeParentMetaDataJsonParam) => {
  const parentMetaData = {
    metadata: {
      name: `Mixture`,
      symbol: 'Mixture',
      image: `${imageNumber}.png`,
      attributes: childrenAttributes,
      properties: {
        files: [
          {
            uri: `${imageNumber}.png`,
            type: 'image/png',
          },
        ],
        creators: [
          {
            address: payer.toString(),
            share: 100,
          },
        ],
        children: [
          {
            is_children: true,
            pubkeys: childNftMints.map(childNftMint => childNftMint.toString()),
          },
        ],
      },
    },
    network: network,
    composableNFTIndex: imageNumber,
    parentNFT: parentNftMint,
  };

  return parentMetaData;
};
