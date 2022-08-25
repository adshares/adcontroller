import { useEffect, useState } from 'react';
import useSkipFirstRenderEffect from './useSkipFirstRenderEffect';
import { returnNumber } from '../utils/helpers';
import { validateAddress } from '@adshares/ads';

const testRequired = (value) => ({
  isValid: !!value,
  helperText: !!value ? '' : 'Required field',
});

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

export default function useForm(options) {
  const [fields, setFields] = useState(options.initialFields);
  const [touchedFields, setTouchedFields] = useState(
    Object.keys(options.initialFields).reduce((acc, val) => ({ ...acc, [val]: false }), {}),
  );
  const [errorObj, setErrorObj] = useState(
    Object.keys(options.initialFields).reduce((acc, val) => ({ ...acc, [val]: { isValid: true, helperText: '' } }), {}),
  );
  const [isFormValid, setIsFormValid] = useState(true);
  const [isFormWasChanged, setIsFormWasChanged] = useState(false);

  useEffect(() => {
    let result = {};
    Object.keys(fields).forEach((name) => {
      result = { ...result, ...validate(name, fields[name]) };
    });
    setErrorObj(result);
  }, [fields, touchedFields]);

  useEffect(() => {
    setIsFormValid(Object.keys(errorObj).every((field) => errorObj[field].isValid));
  }, [errorObj]);

  useSkipFirstRenderEffect(() => {
    checkFormChanged();
  }, [options.initialFields]);

  const setTouched = (e) => {
    setTouchedFields((prevState) => ({ ...prevState, [e.target.name]: true }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    setFields({
      ...fields,
      [name]: options.validation[name].includes('number') ? value.replace(',', '.') : value,
    });
  };

  const resetForm = () => {
    setFields(options.initialFields);
    setTouchedFields(Object.keys(options.initialFields).reduce((acc, val) => ({ ...acc, [val]: false }), {}));
  };

  const checkFormChanged = () => {
    setIsFormWasChanged(
      Object.keys(options.initialFields).some((field) => fields[field].toString() !== options.initialFields[field].toString()),
    );
  };

  const validate = (targetName, targetValue) => {
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

    if (options.validation && Object.keys(options.validation).includes(targetName)) {
      for (let validation of options.validation[targetName]) {
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
  };
}
