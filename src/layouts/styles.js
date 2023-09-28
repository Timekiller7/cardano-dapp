import { makeStyles } from '@mui/styles';
import BackgroundImage from '../assets/images/background/main_background.jpg';

export const useStyles = makeStyles({
  BaseStyles: {
    '--base-font-family':'Inter, sans-serif',
    '--base-font-color': '#FFFFFF',
    '--accent-font-color': 'rgba(248, 127, 10, 1)',
    '--faded-font-color':'#D9DADA',
    '--black-font-color':'#000000',
    
    '--base-font-weight': '300',
    '--semi-bold-font-weight': '400',
    '--bold-font-weight': '700',

    '--font-size-1': '21px',
    '--font-size-2': '25px',
    '--font-size-3': '31px',
    '--font-size-4': '41px',
    '--font-size-5': '42px',
    '--font-size-6': '65px',

    // '--accent-font-color-1':'#FFC086',
    // '--accent-font-color-2': '#FFA723',
    // '--input-border-color-1': '#DCB9FF',
    // '--input-border-color-2': 'rgba(255, 182, 115, 1)',

    '--input-error-font-size':'1rem',
    '--input-error-color': '#FF0000',
    '--input-warning-color': '#FFFF00',

    // '--last-orders-container-header-font-size': '2.6875rem',
    // '--last-orders-container-header-weight': '700',
    // '--last-orders-dummy-font-weight': '500',

    /*Wallet Dialog variables */

  },

  BackgroundHolder: {
    minHeight: '100vh',
    backgroundColor: '#1f1e2e',
    background: `url(${BackgroundImage})`,
    backgroundSize: '100%',
    backgroundPositionX: 'center',

    '@media(max-aspect-ratio: 1/1)':{
      backgroundSize: 'auto 100vh',
    },
  },
  mainContainer: {
    padding: '4.0625rem 0 4.0625rem 0',
    backgroundSize: 'cover',
  },
  wrapper: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 20px',
  }

});