const styles = {

base: {
    width: '100%',
    '& > button': {
        width: '100%',
        height: '3.75rem',
        borderRadius: '0.9375rem',
        border: 'none',

        fontFamily: 'var(--base-font-family)',
        fontSize: 'var(--font-size-2)',
        fontWeight: 'var(--bold-font-weight)',
        color: 'var(--black-font-color)',
    }
},
variants: {
    common: {
        '& > button': {
            background: 'linear-gradient(90.82deg, #FA9432 0%, #D56900 101.82%)',
            '&:hover:not(:disabled), &:focus-visible':{
                outline: '2px solid #AE7DED',
                cursor: 'pointer',
            },
    
            '&:disabled': {
                background: 'linear-gradient(90.82deg, rgba(213, 105, 0, 0.5) 0%, rgba(213, 105, 0, 0.5) 101.82%);',
                outline: '2px solid #2D2D2D',
                cursor: 'not-allowed',
            }
        }
    },
}

}
export default styles;