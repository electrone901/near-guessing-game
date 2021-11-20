import React from 'react'
// import { Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Container,
  Grid,
  Link,
  StylesProvider,
  Typography,
} from '@material-ui/core'
import './Footer.css'
import logo from '../assets/logo.jpg'

function Footer() {
  return (
    <StylesProvider injectFirst>
      <footer>
        <AppBar className="primary-color marginT-3 pad-2" position="static">
          <Grid container>
            <Grid item xs={4} >
            <img src={logo} alt="logo" className="footer-logo" />
            </Grid>
            
            <Grid item xs={8} className="grid-links">
            <a href="/" className="link">
                Home
              </a>
              <span>/</span>

              <a href="/" className="link">
                About
              </a>
              <span>/</span>

              <a href="/" className="link">
              Get Started
              </a>
              <span>/</span>

              <a href="/" className="link">
                Near Community
              </a>
              <span>/</span>

              <a href="/" className="link">
              Privacy
              </a>
            </Grid>

            
            <Grid item xs={12} sm={3}></Grid>

            <Grid item xs={12} sm={12}>
              <Typography className="copyright">
                Copyright &copy; {new Date().getFullYear()} NEAR Games.
              </Typography>
            </Grid>
          </Grid>
        </AppBar>
      </footer>
    </StylesProvider>
  )
}

export default Footer
