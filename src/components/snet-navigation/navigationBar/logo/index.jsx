import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import Paths from '../../../../router/paths';
import MintAndBurnLogo from '../../../../assets/images/logo/cogito-logo-light.svg';
import useNavbarStyles from '../../style';

const MintAndBurnLogoBlock = () => {
  const classes = useNavbarStyles();
  const navigate = useNavigate();

  const onClickLogo = () => {
    navigate(Paths.Voting);
  };

  return (
    <Box onClick={onClickLogo} className={`${classes.flex} ${classes.cursor}`}>
      <img src={MintAndBurnLogo} alt="Logo" className={classes.logo} />
      <span
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          lineHeight: '1rem'
        }}
      >
      </span>
    </Box>
  );
};

export default MintAndBurnLogoBlock;
