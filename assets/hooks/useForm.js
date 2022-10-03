import { useMemo, useState } from 'react';
import { returnNumber } from '../utils/helpers';
import { validateAddress } from '@adshares/ads';

const testRequired = (value) => ({
  isValid: !!value,
  helperText: !!value ? '' : 'Required field',
});

const testUrl = (value) => {
  const isValid = new RegExp(
    '^(https?:\\/\\/)' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))', // OR ip (v4) address
    'i',
  ).test(value);
  return {
    isValid,
    helperText: isValid ? '' : 'Field must be valid URL',
  };
};

const testDomain = (value) => {
  const isValid = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))', // OR ip (v4) address
    'i',
  ).test(value);
  return {
    isValid,
    helperText: isValid ? '' : 'Field must be valid domain',
  };
};

const testEmail = (value) => {
  const isValid = new RegExp(/^[a-z\d_.-]+@[a-z\d_.-]+\.[a-z\d_.-]+[a-z\d]+$/, 'gi').test(value);
  return {
    isValid,
    helperText: isValid ? '' : 'Field must be valid email',
  };
};

const testWallet = (value) => {
  const isValid = validateAddress(value);
  return {
    isValid,
    helperText: isValid ? '' : 'Field must be valid wallet address',
  };
};

const testWalletSecret = (value) => {
  const isValid = new RegExp(/^[\dA-F]{64}$/, 'g').test(value);
  return {
    isValid,
    helperText: isValid ? '' : 'Invalid secret key',
  };
};

const testLicenseKey = (value) => {
  const isValid = new RegExp(/^(COM|SRV)-[\da-z]{6}-[\da-z]{5}-[\da-z]{5}-[\da-z]{4}-[\da-z]{4}$/, 'gi').test(value);
  return {
    isValid,
    helperText: isValid ? '' : 'Field must be valid license key',
  };
};

const testInteger = (value) => {
  const isValid = new RegExp(/^\d*$/).test(value);
  return {
    isValid,
    helperText: isValid ? '' : 'Field must be valid integer number',
  };
};

const testNumber = (value) => {
  const isValid = !isNaN(returnNumber(value));
  return {
    isValid: isValid,
    helperText: isValid ? '' : 'Field must be valid number',
  };
};

const validate = (targetName, targetValue, validationOptions) => {
  const validValueResult = {
    isValid: true,
    helperText: '',
  };
  const validationResult = {};

  const validateValue = (option, value) => {
    switch (option) {
      case 'required':
        return testRequired(value);

      case 'email':
        return value ? testEmail(value) : validValueResult;

      case 'domain':
        return value ? testDomain(value) : validValueResult;

      case 'url':
        return value ? testUrl(value) : validValueResult;

      case 'wallet':
        return value ? testWallet(value) : validValueResult;

      case 'walletSecret':
        return value ? testWalletSecret(value) : validValueResult;

      case 'licenseKey':
        return value ? testLicenseKey(value) : validValueResult;

      case 'integer':
        return value ? testInteger(value) : validValueResult;

      case 'number':
        return value ? testNumber(value) : validValueResult;

      default:
        return validValueResult;
    }
  };

  if (validationOptions && Object.keys(validationOptions).includes(targetName)) {
    for (let validation of validationOptions[targetName]) {
      validationResult[targetName] = validateValue(validation, targetValue);
      if (!validationResult[targetName].isValid) {
        break;
      }
    }
  } else {
    validationResult[targetName] = validValueResult;
  }
  return validationResult;
};

export default function useForm(options) {
  const [fields, setFields] = useState(options.initialFields);
  const [touchedFields, setTouchedFields] = useState(
    Object.keys(options.initialFields).reduce((acc, val) => ({ ...acc, [val]: false }), {}),
  );

  const errorObj = useMemo(
    () => Object.keys(fields).reduce((acc, fieldName) => ({ ...acc, ...validate(fieldName, fields[fieldName], options.validation) }), {}),
    [fields, touchedFields],
  );
  const isFormValid = useMemo(() => Object.keys(errorObj).every((field) => errorObj[field].isValid), [errorObj]);
  const isFormWasChanged = useMemo(
    () => Object.keys(options.initialFields).some((field) => fields[field].toString() !== options.initialFields[field].toString()),
    [options.initialFields],
  );
  const changedFields = useMemo(
    () =>
      Object.keys(options.initialFields).reduce(
        (acc, fieldName) => ({ ...acc, [fieldName]: options.initialFields[fieldName] !== fields[fieldName] }),
        {},
      ),
    [fields, touchedFields],
  );

  const setTouched = (e) => {
    if (!touchedFields[e.target.name]) {
      setTouchedFields((prevState) => ({ ...prevState, [e.target.name]: true }));
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFields({
      ...fields,
      [name]: value.toString(),
    });
  };

  const resetForm = () => {
    setFields(options.initialFields);
    setTouchedFields(Object.keys(options.initialFields).reduce((acc, val) => ({ ...acc, [val]: false }), {}));
  };

  return {
    fields,
    errorObj,
    setFields,
    isFormValid,
    onChange,
    setTouched,
    touchedFields,
    resetForm,
    isFormWasChanged,
    changedFields,
  };
}
