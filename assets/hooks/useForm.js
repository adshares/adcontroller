import { useEffect, useState } from 'react';

export default function useForm(defFields) {
  const [fields, setFields] = useState(defFields);
  const [errorObj, setErrorOnj] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    checkIsFormValid();
  }, [fields, errorObj]);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setFields({
      ...fields,
      [name]: value,
    });
    validate(e.target);
  };

  const validate = (target) => {
    const { name, value } = target;
    const emailRegEx = /^[a-z\d_.-]+@[a-z\d_.-]+\.[a-z\d_.-]+[a-z\d]+$/gi;
    const walletAddressRegEx = /^[0-9A-F]{4}-[0-9A-F]{8}-([0-9A-F]{4})$/g;
    const walletSecretRegEx = /^[0-9A-F]{64}$/g;
    const licenseKeyRegEx = /^(COM|SRV)-[\da-z]{6}-[\da-z]{5}-[\da-z]{5}-[\da-z]{4}-[\da-z]{4}$/gi;
    const integer = /^\d*$/;
    const errors = {};

    if (!name) {
      return;
    }

    if (!value) {
      errors[name] = 'Required field';
    } else if (name.includes('email') && !emailRegEx.test(value)) {
      errors[name] = 'Field must be an email';
    } else if (name === 'WalletAddress' && !walletAddressRegEx.test(value)) {
      errors[name] = 'Invalid wallet address format';
    } else if (name === 'WalletSecretKey' && !walletSecretRegEx.test(value)) {
      errors[name] = 'Invalid secret key';
    } else if (name === 'licenseKey' && !licenseKeyRegEx.test(value)) {
      errors[name] = 'Invalid license key';
    } else if (name === 'WalletNodePort' && !integer.test(value)) {
      errors[name] = 'Port must be an number';
    } else {
      errors[name] = '';
    }

    setErrorOnj({
      ...errorObj,
      ...errors,
    });
  };

  const checkIsFormValid = () => {
    const isEmptyFields = Object.keys(fields).some((el) => {
      if (el === 'data_required' || el === 'message' || el === 'code') {
        return;
      }
      return !fields[el];
    });
    const isFormErrors = Object.keys(errorObj).some((el) => !!errorObj[el]);
    setIsFormValid(!isEmptyFields && !isFormErrors);
  };

  return {
    fields,
    errorObj,
    setFields,
    isFormValid,
    onFormChange,
    validate,
  };
}
