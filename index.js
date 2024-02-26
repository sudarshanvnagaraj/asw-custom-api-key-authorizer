const ExceptionWrapper = require('exception-handler');
const commonMessage = require('./constants/common-messages');
const CustomKeyWrapper = require('./constants/custom-credentials');
const customKeyHandler = new CustomKeyWrapper();
const exceptionHandler = new ExceptionWrapper();
exports.handler = async (event) => {
    const findValidateTokenTime = new Date();
    const { headers } = event;
    let tokenValidator = {};
    const validateCredentails = await validateClientIdSecret(headers['client_id'], headers['client_secret']);
    console.log(`validateCredentails : ${JSON.stringify(validateCredentails)}`);
    try {
        switch (validateCredentails) {
            case true:
                tokenValidator = await generatePolicy('user', 'Allow', event.methodArn, validateCredentails);
                break;
            case 'deny':
            case false:
                tokenValidator = await generatePolicy('user', 'Deny', event.methodArn, validateCredentails);
                break;
            case 'unauthorized':
                throw(401, 'Unauthorized', 'Unauthorized'); // Return a 401 Unauthorized response
            default:
                throw(401, 'Unauthorized', 'Unauthorized'); // Return a 401 Unauthorized response
        }
    } catch (error) {
        console.log(`error  ${JSON.stringify(error)}`);
        console.log(`time taken complete token authorizer call  : ${Math.abs(new Date() - findValidateTokenTime) / 1000} seconds`);
        throw(error.httpStatus , error.errorType, error.errorType); // Return a 401 Unauthorized response

    }
    console.log(`time taken complete token authorizer call  : ${Math.abs(new Date() - findValidateTokenTime) / 1000} seconds`);
    return tokenValidator;
};

async function validateClientIdSecret(clientId, clientSecret) {
    let status = false;
    const credentials = await customKeyHandler.getCredentials();
    if (clientId === credentials.client_id && clientSecret === credentials.client_secret) {
        // If valid, allow the request
        status = true;
    } else {
        status = false;
    }
    return status;
}
// Helper function to generate IAM policy
async function generatePolicy(principalId, effect, resource, validateTokenResponse) {
    console.log(`generatePolicy calling now principalId :${JSON.stringify(principalId)}`);
    console.log(`generatePolicy calling now effect :${JSON.stringify(effect)}`);
    console.log(`generatePolicy calling now resource :${JSON.stringify(resource)}`);
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
      const policyDocument = {};
      policyDocument.Version = '2012-10-17';
      policyDocument.Statement = [];
      const statementOne = {};
      statementOne.Action = 'execute-api:Invoke';
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
    }
  
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
      active: validateTokenResponse,
    };
    // console.log(`final authResponse : ${JSON.stringify(authResponse)}`);
    return authResponse;
  }