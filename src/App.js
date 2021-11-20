import 'regenerator-runtime/runtime'
import React, { useEffect } from 'react'
import { login, logout } from './utils'
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import {
  TextField,
  Container,
  StylesProvider,
  Typography,
  Button,
  IconButton,
  MenuItem,
} from '@material-ui/core'
import './global.css'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')
import { Navbar } from './navbar/Navbar'

export default function App() {
  let user;
  const [greeting, set_greeting] = React.useState()
  const [winningNumber, setWinningNumber] = React.useState('')
  const [guessNumb, setGuessNumb] = React.useState('')
  const [feedbackMsg, setFeedbackMsg] = React.useState('')
  const [animation, setAnimation] = React.useState(false)
  const { width, height } = useWindowSize()
  const [winner, setWinner] = React.useState(false)

  // gets user name 
  if(window.accountId) {
    const userArr = window.accountId.split('.')
    user = userArr[0]
  }


  const [buttonDisabled, setButtonDisabled] = React.useState(true)
  // shows Notification
  const [showNotification, setShowNotification] = React.useState(false)

  const reset = () => {
    window.location.reload()
  }
  console.log("winningNumber", winningNumber)

  const checkGuessNumber = async(e) => {
    e.preventDefault()
    if (!guessNumb || guessNumb < 0 || guessNumb > 20) {
      setFeedbackMsg("Please enter a valid number from 0 to 20.")
    }

    let num1 = winningNumber
    let num2 = parseInt(guessNumb)

    if (num1 == num2) {
      try {
        setFeedbackMsg("🏆🏆 You Win! 🏆🏆 ")
        setWinner(true)
        setAnimation(true)
        //call the contract
        await window.contract.set_greeting({
          message: `Winner`
        })
        // shows Notification
       setShowNotification(true)
       // clean up notification again after 11 seconds
       setTimeout(() => {
         setShowNotification(false)
       }, 11000)   
      } catch (e) {
        alert(
          'Something went wrong! ' +
          'Maybe you need to sign out and back in? ' +
          'Check your browser console for more info.'
        )
        throw e
      }    
      return
    } 

    const dif = Math.abs(num1 - num2)
    if (dif <= 3) {
      setFeedbackMsg("You're very close😌💭👍!")
      return
    }     
    if (dif > 3 && dif <= 8) {
      setFeedbackMsg("You're lukewarm😊😊😊")
      return
    } 
    if (dif > 10) {
      setFeedbackMsg("You're a bit chilly🥶🥶🥶🥶")
      return
    }
  }


  // The useEffect hook can be used to fire side-effects during render
  React.useEffect(
    () => {
      // sets winnerNum 
      setWinningNumber(Math.ceil(Math.random() * 20))
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.get_greeting({ account_id: window.accountId })
          .then(greetingFromContract => {
            set_greeting(greetingFromContract)
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEAR!</h1>
        <p>
          To make use of the NEAR blockchain, you need to sign in. The button
          below will sign you in using NEAR Wallet.
        </p>

        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    <>
    <Navbar onClick={logout} />
    {
      winner ? <Confetti
      width={width}
      height={height}
      options={{recycle: false}}
      recycle={false}
      tweenDuration={8000}
      numberOfPieces={500}
      gravity={0.1}
      />:''
    }
    
    <Container
        className="root-create-pet"
        style={{ minHeight: '50vh', paddingBottom: '3rem' }}
      >
        <div>
          <h1>
          <label
            htmlFor="greeting"
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
            {`Welcome back ${user}!`}
          </label>
          <p> Dare to Play? Enter a number from 0 - 20</p>
        </h1>
    
          <div className="form-container">
            <form className="form" noValidate autoComplete="off">
              <TextField
                id="outlined-basic"
                label="Guess a number between 0 - 20"
                variant="outlined"
                className="text-field"
                defaultValue={guessNumb}
                type="number"
                onChange={(e) => setGuessNumb(e.target.value)}
              />
              
              <Button
                size="large"
                variant="contained"
                color="primary"
                onClick={checkGuessNumber}
              >
                Go
              </Button>
            </form>

            <p className="feedbackMsg">{feedbackMsg}</p>
            
            { 
            winner ?
            <div className="btn-play-again">
            <Button  size="large" color="secondary" variant="contained" onClick={reset}>Play Again</Button>
            </div>:
            '' 
            }
            
          </div>
          {showNotification && <Notification />}
        </div>
      </Container>

      



      {/* <main>
        <h1>
          <label
            htmlFor="greeting"
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
            {`${greeting} ${user}!`}
          </label>
        </h1>

        
        
        <label htmlFor="guess"></label>
        <div class="form-group">
            <input type="number" placeholder="Enter a number" id="guess" value={guessNumb} onChange={setGuessNumb} required />
            <button id="submit" onClick={checkGuessNumber}>Go</button>
        </div>
        <div class="buttons">
            <button id="hint-btn">Hint</button>
            <button id="play-again">Play Again</button>
        </div>
        



        <form onSubmit={async event => {
          event.preventDefault()

          // get elements from the form using their id attribute
          const { fieldset, greeting } = event.target.elements

          // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const newGreeting = greeting.value

          // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            const res = await window.contract.set_greeting({
              // pass the value that the user entered in the greeting field
              message: newGreeting
            })
            console.log("res", res)
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Saving greeting check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }

          // update local `greeting` variable to match persisted value
          set_greeting(newGreeting)

          // show Notification
          setShowNotification(true)

          // remove Notification again after css animation completes
          // this allows it to be shown again next time the form is submitted
          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="greeting"
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Change greeting
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete="off"
                defaultValue={greeting}
                id="greeting"
                onChange={e => setButtonDisabled(e.target.value === greeting)}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Save
              </button>
            </div>
          </fieldset>
        </form>
        {showNotification && <Notification />}


        <p>
          Look at that! A Hello World app! This greeting is stored on the NEAR blockchain. Check it out:
        </p>
        <ol>
          <li>
            Look in <code>src/App.js</code> and <code>src/utils.js</code> – you'll see <code>get_greeting</code> and <code>set_greeting</code> being called on <code>contract</code>. What's this?
          </li>
          <li>
            Ultimately, this <code>contract</code> code is defined in <code>assembly/main.ts</code> – this is the source code for your <a target="_blank" rel="noreferrer" href="https://docs.near.org/docs/develop/contracts/overview">smart contract</a>.</li>
          <li>
            When you run <code>yarn dev</code>, the code in <code>assembly/main.ts</code> gets deployed to the NEAR testnet. You can see how this happens by looking in <code>package.json</code> at the <code>scripts</code> section to find the <code>dev</code> command.</li>
        </ol>
        <hr />
        <p>
          To keep learning, check out <a target="_blank" rel="noreferrer" href="https://docs.near.org">the NEAR docs</a> or look through some <a target="_blank" rel="noreferrer" href="https://examples.near.org">example apps</a>.
        </p>
      </main>
      
      {showNotification && <Notification />} */}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'set_greeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
