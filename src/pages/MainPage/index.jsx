import { Helmet } from 'react-helmet';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import GeneralLayout from '../../layouts/GeneralLayout';
import { useStyles } from './styles';
import { useDispatch, useSelector } from 'react-redux';

import { isMobile } from 'react-device-detect';

import MintAndBurnForms from '../../components/mint-and-burn-forms';

const MainPage = () => {
    const classes = useStyles();
    const isLoading = useSelector(state => state.application.isLoading);

    function MobileDummy(){
        return (
            <div className={classes.mobileDummy}>
                Mobile version is not supported
            </div>
        );
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={isLoading}>
                <CircularProgress color="white" />
            </Backdrop>
            <Helmet>
                <title>Cogito GCOIN</title>
            </Helmet>
            <GeneralLayout>
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" width="100%">
                    {isMobile ?
                        <MobileDummy/>
                        :
                        <MintAndBurnForms></MintAndBurnForms>
                    }
                </Box>
            </GeneralLayout>
        </>
    );
};
export default MainPage;
