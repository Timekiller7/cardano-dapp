const styles = {

base: {
    
    '& > button': {
        // width: '100%',
        padding: '0.5rem 2.5rem',
        borderRadius: '0.9375rem',
        border: 'none',
        color: 'var(--base-font-color)',
        
        fontSize: 'var(--font-size-3)',

        fontFamily: 'var(--base-font-family)',
        fontWeight: 'var(--base-font-weight)',

        background: 'transparent',
        outline: '2px solid var(--base-font-color)',

        '&:hover:not(:disabled), &:focus-visible':{
            cursor: 'pointer',
        },

        '&:disabled': {
            background: 'linear-gradient(157.81deg, rgba(123, 144, 220, 0.6) 5.82%, rgba(206, 67, 255, 0.516) 95.02%)',
            outline: '2px solid #2D2D2D',
            cursor: 'not-allowed',
        }
    }
},
variants: {
}

}
export default styles;