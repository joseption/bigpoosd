import React, { useEffect, useState } from 'react';
import { config } from '../Constants'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

function PasswordSent(props)
{    
    const [disabled,setDisabled] = useState('');
    const [time,setTime] = useState(0);
    const [counter,setCounter] = useState('');
    const [message,setMessage] = useState('');

    useEffect(() => {
        let interval;
        if (disabled) {
            interval = setInterval(() => {
                if (Date.now() - time >= 60000) {
                    setDisabled(false);
                    setCounter("");
                    clearInterval(interval);
                    setTime(0);
                }
                else {
                    if (message) {
                        clearInterval(interval);
                        setTime(0);
                        setCounter("");
                        setDisabled(false);
                        return;
                    }
                    setCounter("Try again in " + Math.abs(Math.round(60 - ((Date.now() - time) / 1000))) + " seconds");
                    setDisabled(true);
                }
            }, 1000);
        }
        else {
            if (interval)
                clearInterval(interval);
            setCounter("");
            setTime(0);
            setDisabled(false);
        }
    }, [disabled, time, message]);

    const disableBtn = (disable) => {
        if (disable)
            setTime(Date.now());
        else 
            setTime(0);

        setDisabled(disable);
    }

    const doResendEmail = async event => 
    {
        event.preventDefault();
        disableBtn(true);
        setMessage("");
        if (!props.email) {
            setMessage("You must use a valid email address");
            disableBtn(false);
            return;
        }
        
        let obj = {email:props.email};
        let js = JSON.stringify(obj);

        try
        {    
            await fetch(`${config.URL}/api/send-password-reset`,
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}}).then(async ret => {
                    let res = JSON.parse(await ret.text());
                    if(res.error)
                    {
                        if (res.error === "Invalid Email") {
                            setMessage("You must use a valid email address");
                        }
                        else
                            setMessage(res.error);

                        disableBtn(false);
                    }
                });
        }
        catch(e)
        {
            disableBtn(false);
            setMessage("An error occurred while attempting to send a password reset email!");
            return;
        }    
    };

    return(
        <div>
            <form className="login-form" onSubmit={doResendEmail}>
                <div className="login-title-container">
                    <FontAwesomeIcon onClick={() => props.setScreen("forgot_password")} className="login-navigate-btn" icon={solid('arrow-left')} />
                    <span className="login-title">Reset Link Sent</span>
                </div>
                <div className="login-reset-sent-title">We attempted to send you a password reset link. Visit the link and follow the reset instructions.</div>
                <div className="login-forgot-msg"><b>Please check your inbox</b></div>
                <hr className="splitter" />
                <div className="login-reset-resend-title">Still haven't received an email yet?</div>
                <input type="submit" disabled={disabled} className="btn btn-success" value={!disabled ? 'Resend Email' : 'Email Sent'} onClick={doResendEmail} />
            </form>
            <div className="login-timer">{counter}</div>
            <div className="login-error-msg">{message}</div>
        </div>
    );
};

export default PasswordSent;
