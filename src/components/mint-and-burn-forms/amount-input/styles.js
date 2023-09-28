import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
    AmountContainer:{
        width: '100%',
        fontSize: 'var(--font-size-1)',
        fontWeight: 'var(--base-font-weight)',

        '& .right-side-container':{
            margin:'auto',
            display: 'flex',
            justifyContent: 'end',
            color: 'var(--base-font-color)',

        },
        '& .input-container':{  
            position: 'relative',
            margin: '0.9375rem 0px',

            '& input':{
                '-webkit-appearance': 'none',
                
                outline: 'none',
                background: 'transparent',
                minWidth: 'unset',
                width: '100%',
                padding: '1.4375rem 0.9375rem',
                paddingRight: '3.625rem',

                border: '0.125rem solid var(--base-font-color)',
                borderRadius: '0.9375rem',
                fontFamily:'var(--base-font-family)',
                fontSize: 'var(--font-size-1)',
                color: 'var(--base-font-color)',

                '&::placeholder':{
                    color: 'var(--base-font-color)',
                },
            },

            '&.invalid input':{
                border: '0.125rem solid var(--input-error-color)',
            },

            '& .max-amount-container':{
                position:'absolute',
                right: '0.625rem',
                top: '0px',
                height: '100%',

                display: 'flex',
                alignItems: 'center',
                color: 'var(--accent-font-color-2)',
                cursor: 'pointer',
            }
        },

    },
    WarningsAndErrorsContainer:{
        minHeight: '6rem',
        fontSize: 'var(--input-error-font-size)',

        '& .warnings-list':{
            color: 'var(--input-warning-color)',
        },

        '& .errors-list':{
            color: 'var(--input-error-color)',
        },
    }


});