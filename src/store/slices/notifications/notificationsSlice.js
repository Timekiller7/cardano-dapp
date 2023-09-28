import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: {
        showNotification: false,
        message: '',
        type: 'warning'//need to provide default not empty
    },
    reducers: {
        closeNotification: (state) => {
            state.showNotification = false;
            state.message = '';
        },
        showErrorNotification: (state, action) => {
            state.showNotification = true;
            state.message = action.payload.message;
            state.type = "error";          
        },
        showSuccessNotification: (state, action) => {
            state.showNotification = true;
            state.message = action.payload.message;
            state.type = "success";   
        },
        showWarningNotification: (state, action) => {
            state.showNotification = true;
            state.message = action.payload.message;
            state.type = "warning";   
        },
        showInformationNotification: (state, action) => {
            state.showNotification = true;
            state.message = action.payload.message;
            state.type = "info";   
        }
    }
});

export const { closeNotification, showErrorNotification, showSuccessNotification, showWarningNotification, showInformationNotification } = notificationsSlice.actions;

export default notificationsSlice;