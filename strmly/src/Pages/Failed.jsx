import { Container, CssBaseline, Typography } from "@mui/material";
import React from "react";

export default function Failed () {
    return(
        <Container>
            <CssBaseline/>
            <Typography variant="h5" >Onboarding failed :( Something went wrong. Try again later.</Typography>
            <Typography></Typography>
        </Container>
    );
}