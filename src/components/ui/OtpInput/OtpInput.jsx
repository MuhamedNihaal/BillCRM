import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const Otp = ({ setOtp }) => {
  let [optValue, setOtpValue] = useState(Array(6).fill(""));

  useEffect(() => {
    setOtp(optValue.join(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optValue]);

  const handleChange = (value, idx) => {
    if (!/^\d{1,2}$/.test(value)) return;

    let finalOtp = value.slice(-1);

    setOtpValue((prev) => {
      let otpArray = [...prev];
      otpArray[idx] = finalOtp;
      return otpArray;
    });

    if (finalOtp && idx < 5) {
      document.getElementById(`otp-input-${idx + 1}`).focus();
    }
  };

  const handleKeyDown = (e, idx = null) => {
    if (e.key === "Backspace" && idx) {
      setOtpValue((prev) => {
        let otpArray = [...prev];
        if (otpArray[idx]) {
          otpArray[idx] = "";
        } else if (idx > 0) {
          otpArray[idx - 1] = "";
          document.getElementById(`otp-input-${idx - 1}`)?.focus();
        }

        return otpArray;
      });
    }
  };

  return (
    <div className="OtpInput my-4 flex items-center justify-center gap-[18px]">
      {optValue.map((_, idx) => (
        <input
          className="form-input-base form-input peer focus:border-primary-600 dark:border-dark-450 dark:hover:border-dark-400 dark:focus:border-primary-500 h-10 w-10 max-sm:w-9 max-sm:h-9 rounded-md border-gray-300 text-center hover:border-gray-400"
          autoFocus={idx === 0 ? true : false}
          type="text"
          id={`otp-input-${idx}`}
          value={optValue[idx] || ""}
          key={idx}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
        />
      ))}
    </div>
  );
};

Otp.propTypes = {
  setOtp: PropTypes.func.isRequired,
};

export default Otp;
