import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
    form: {
        borderRadius: '0.9375rem',
        color: 'var(--base-font-color)',
        fontSize: 'var(--font-size-2)',
        padding: '3.125rem',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:'var(--base-font-family)',
        fontWeight: 'var(--semi-bold-font-weight)',

        background: 'linear-gradient(0.21deg, #232323 0.19%, #17181C 98.03%)',

        '& .header': {
            fontSize: 'var(--font-size-5)',
            fontWeight: 'var(--bold-font-weight)',
            color: 'var(--accent-font-color)',
            marginBottom: '0.75rem',
        },

        '& .smallPrint': {
            fontSize: 'var(--font-size-1)',
            fontWeight: 'var(--base-font-weight)',
            marginBottom: '1.3125rem',
            display: 'flex',
        },
        
        '& .details-list':{
            'margin-bottom': '2.8125rem',

            '& .details-item':{
                marginBottom:'1.3125rem',
                display: 'flex',
                justifyContent: 'space-between',

                '&:last-child':{
                    marginBottom: '0px',
                },

                '& span':{
                    fontWeight: 'var(--bold-font-weight)',
                }
            },
        }
    }

});