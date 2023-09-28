import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles({
    MintAndBurnForms: {
        width:'100%',
        display: 'flex',
        flexDirection: 'column',
        // marginBottom: '4.0625rem',
    },
    HeaderContainer: {
        marginBottom: '4rem',
        fontFamily: 'var(--base-font-family)',
        color: 'var(--base-font-color)',
        '& > *:not(:last-child)':{
            marginBottom: '4rem',
        },


    },
    Title: {
        // margin: 'auto',
        fontSize: 'var(--font-size-6)',
        fontWeight: 'var(--bold-font-weight)',
        
    },
    Description:{
        fontSize: 'var(--font-size-4)',
        fontWeight: 'var(--semi-bold-font-weight)',
        color: 'var(--faded-font-color)',
        '& span':{
            fontWeight: 'var(--bold-font-weight)',
        },
    },
    FormsContainer: {
        width:'100%',
        display: 'grid',
        columnGap: '3%',
        rowGap: '2rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    },
})