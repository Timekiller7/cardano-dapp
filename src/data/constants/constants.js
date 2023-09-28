import NamiWallet from '../../assets/images/walletsIcons/nami_logo.svg';
import EternalWallet from '../../assets/images/walletsIcons//eternal_logo.png';
import CardanoLogo from '../../assets/images/blockchainIcons/cardano.png'


export const availableBlockchains = {
    ETHEREUM: "Ethereum",
    CARDANO: "Cardano"
}

export const cardanoBlockchain = {
    name: "Cardano",
    logo: CardanoLogo,
};
export const cardanoNetworks = [
    {
        chainID: '0',
        name: 'preprod testnet',
    },
];

export const supportedWallets = {
    CARDANO: [
        {
            wallet: 'Nami',
            identifier: 'nami',
            logo: NamiWallet,
            site: 'https://namiwallet.io/'
        },
        {
            wallet: 'Eternl',
            identifier: 'eternl',
            logo: EternalWallet,
            site: 'https://eternl.io/'
        },
    ]
};


export const inputErrors = {
    warnings: {
        triedInputMoreThenOneDot : "You tried to enter a dot, but the dot was already in the entered value",
        triedTooManyCharactersIntegerPart : "You tried to enter too many digits",
        triedTooManyCharactersFractionalPart : "You tried to enter too many characters in a fractional part",
    },
    errors: {
        noIntegerPart: {message: "Enter the integer part of the value", type: 'syntax'},
        noFractionalPart: {message: "Enter the fractional part of the value or remove the dot", type: 'syntax'},
        leadingZeros: {message: "Remove leading zeros", type: "syntax"},
        emptyStringCheck: {message: "", type: "syntax"},

        enteredTooManyCharactersIntegerPart : {message: "You entered too many digits", type: "other"},
        enteredTooManyCharactersFractionalPart : {message: "You entered too many characters in a fractional part", type: "other"},
     
        noCurrentWallet: {message: "", type: "valueRestrictions"},
        insufficientBalance: {message: "Insufficient wallet balance",type: "valueRestrictions"},
        amountLessThenMin: {message: "The amount is less than the minimum allowable", type: "valueRestrictions"}
    }
};
export const maxCharactersInIntegerPartOfInput = 10;
export const maxCharactersInFractionalPartOfInput = 6;