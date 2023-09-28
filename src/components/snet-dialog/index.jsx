import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import dialogueStyle from './style';
import propTypes from 'prop-types';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  },
}));

const SnetDialog = ({ isDialogOpen, onDialogClose, title, children, showClosebutton }) => {

  return (
    <BootstrapDialog maxWidth="xl" onClose={onDialogClose} aria-labelledby="snet-dialog-title" open={isDialogOpen} PaperProps={{style: {
      background: "linear-gradient(0.21deg, #232323 0.19%, #17181C 98.03%)",
      // background: "linear-gradient(red, blue)",
      // backgroundColor: "red",
      boxShadow: 'none',
      color: '#FFFFFF',


      // fontFamily: 'Mulish',
      fontFamily: 'Inter, sans-serif',

      borderWidth : 10,
      borderRadius: 15,
      borderColor : "#FFFFFF",
      // backgroundColor : "#101010"



    },}}>
      <DialogTitle sx={{ ...dialogueStyle.dialogTitle, textAlign: onDialogClose ? 'left' : 'center' }}>
        {title}
        {showClosebutton ? (
          <IconButton aria-label="close" onClick={onDialogClose} sx={dialogueStyle.iconButton}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent dividers sx={{ ...dialogueStyle.dailogContent, borderTop: "1px solid rgba(238, 238, 238, 1)" }}>
        {children}
      </DialogContent>
    </BootstrapDialog>
  );
};

SnetDialog.propTypes = {
  isDialogOpen: propTypes.bool.isRequired,
  onDialogClose: propTypes.func.isRequired,
  title: propTypes.string.isRequired,
  children: propTypes.node.isRequired,
  showClosebutton: propTypes.bool
};

SnetDialog.defaultProps = {
  showClosebutton: true
};

export default SnetDialog;
