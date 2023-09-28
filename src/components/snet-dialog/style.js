import ColorCodes from '../../assets/theme/colorCodes';

const snetDialogStyles = {
  dialogTitle: {
    m: 0,
    // color: 'var(--base-font-color)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '22px',
    fontWeight: '700',
    lineHeight: '24px',
    padding: '22px 32px !important',
  },
  iconButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    color: (theme) => theme.palette.grey[100],
    '& svg': { fontSize: 24 }
  },
  dailogContent: {
    maxWidth: '800px',
    minWidth: '600px',
    padding: '30px 32px !important',
    fontFamily: 'Inter, sans-serif',  
    fontSize: '20px',
  }
};

export default snetDialogStyles;
