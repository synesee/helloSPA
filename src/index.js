
"use strict";
//hello commmit change
var AWS = require("aws-sdk");  // Always include if you want to have access to AWS Resources
AWS.config.update({region: 'us-east-1'}); // Necessary or function will fail on call to some AWS Resources (Could be ENV var?)

const EVENT_TYPE = "eventType";
const EVENT_API_GW_PARSED = "apiGWParsed";
const EVENT_API_GW_PROXY = "apiGWProxy";
const EVENT_SNS = "sns";
const EVENT_S3 = "s3";
const EVENT_SES = "SES";
const EVENT_DYNAMO_DB = "dynamoDB";


/*
 Base Lambda Template to show how to attach event to Data object and use Promise Series

 Input  : Event from AWS (ApiGW, DynamoDB Stream, SNS Message, etc.)
 Output : Writes the event to CloudWatch

 */


function apigwParsedHandler() {
    console.log('apigwParsedHandler');
}

function apigwProxyHandler() {
    console.log('apigwProxyHandler');
}

function *someSubGen(myparms) {
    console.log("Enter Sub Generator");
    console.log("Passed In Params: " + myparms);
    try {
        var result = yield getAsyncVal(103);
        console.log( result );
        var result2 = yield getAsyncVal(104);
        console.log( result2 );
    }
    catch (err) {
        console.error( err );
    }
    console.log("Exit Sub Generator");
}

function *snsHandler(event) {
    console.log('Begin snsHandler');

    var calledEvent = event[EVENT_TYPE];
    console.log('Passed In Event: ' + calledEvent);

    var myparams = "Some Passed In Vals";

    // ok, let's setup a series of fake async calls
    try {
        var result = yield getAsyncVal(101);
        console.log( result );
        var result2 = yield getAsyncVal(102);
        console.log( result2 );
        yield *someSubGen(myparams);
        var result5 = yield getAsyncVal(105);
        console.log( result5 );
    }
    catch (err) {
        console.error( err );
    }

    /*
     // construct an iterator `it` to control the generator
     var it = genControl();
     var p = it.next().value; // get the promise

     p.then (
     function (inVal) {
     it.next(inVal);
     },
     function (err) {
     it.throw( err );
     }
     );
     */
    console.log('End snsHandler');
}

function s3Handler() {
    console.log('s3Handler');
}

function sesHandler() {
    console.log('sesHandler');
}

function dynamoDBHander() {
    console.log('dynamoDBHander');
}

// build a timer function that is wrapped in a promise
function getAsyncVal(timeToWait) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve("theValue - Passed In Wait Time: " + timeToWait);
        }, timeToWait);
    });
}


exports.handler = function(event, context, callback) {
    // we are dealing with an event, so we need to get the data
    // from the event, and figure out what to do with it

    // we may use events like SNS to notify of a different event source
    // so we will probably need some special logic that will help us figure that out

    // we want to parse the event - we already have it, so this is synchronous
    var inEvent = {};
    inEvent.event = event;
    inEvent = parseEvent(inEvent);
    // we need to know the event source, so we should pass this in from the parseEvent

    if (inEvent && inEvent.hasOwnProperty(EVENT_TYPE)) {
        switch (inEvent[EVENT_TYPE]) {
            case EVENT_API_GW_PARSED:
                apigwParsedHandler(inEvent);
                break;
            case EVENT_API_GW_PROXY:
                apigwProxyHandler(inEvent);
                break;
            case EVENT_SNS :
                run(snsHandler, inEvent);
                break;
            case EVENT_S3 :
                s3Handler(inEvent);
                break;
            case EVENT_SES :
                sesHandler(inEvent);
                break;
            case EVENT_DYNAMO_DB :
                dynamoDBHander(inEvent);
                break;
            default :
                console.log("No Event, Or Event Type Not Supported");
        }

    }
    console.log("Exiting Handler Function");
}

/*
 Run is a wrapper function that takes a generator as its argument
 and runs through each of the Yeilds (which return promises) and
 makes sure they are resolved to a value, then moves to the next
 yield statement until it reaches the end.

 This version was taken from the internet, and I know it works
 with promises, but there I haven't tested other types of values
 and it will need to be able to support that obviously.

 INPUT: generator function (arguments passed as the second argument)
 OUTPUT: returned values from resolved promises called by generator

 Example: run(myGenerator) -or- run(myGenerator, myArguments)

 Generators called from with the passed in generator will also
 be iterated in the same fashion (no second call to run necessary)

 Example: var myResutsVar = yield *mySubGenerator(mySubArgs);

 */

function run(gen) {
    var args = [].slice.call( arguments, 1), it;
    // initialize the generator in the current context
    it = gen.apply( this, args );
    // return a promise for the generator completing
    return Promise.resolve()
        .then( function handleNext(value){
            // run to the next yielded value
            var next = it.next( value );
            return (function handleResult(next){
                // generator has completed running?
                if (next.done) {
                    return next.value;
                }
                // otherwise keep going
                else {
                    return Promise.resolve( next.value )
                        .then(
                            // resume the async loop on
                            // success, sending the resolved
                            // value back into the generator
                            handleNext,
                            // if `value` is a rejected
                            // promise, propagate error back
                            // into the generator for its own
                            // error handling
                            function handleErr(err) {
                                return Promise.resolve(
                                    it.throw( err )
                                )
                                    .then( handleResult );
                            }
                        );
                }
            })(next);
        } );
}

/**
 * Parses event record provided and makes sure the even is proper to init this function.
 *
 * @param {object} data - Data bundle with context, email, etc.
 *
 * @return {object} - Promise resolved with data.
 */

function parseEvent(data) {


    // Make sure we have an event - Should always have this!
    if(!data.hasOwnProperty('event')) {
        console.log("No event passed to Lambda"); // this should never happen
        return false;
    }

//    var event = data.event;

//    console.log("ParseEvent: Incoming Event:" + JSON.stringify(data.event));

    // API Gateway
    if(data.event.hasOwnProperty('body') ) {
        // We know that this event is from APIGW
        data[EVENT_TYPE] = EVENT_API_GW_PARSED;
        data.body = data.event.body;
        // so now we will set all the incoming params - Always check for exists
        if(data.event.hasOwnProperty('headers')) data.headers = data.event.headers;
        if(data.event.hasOwnProperty('method')) data.method = data.event.method;
        if(data.event.hasOwnProperty('principalId')) data.principalId = data.event.principalId;
        if(data.event.hasOwnProperty('stage')) data.stage = data.event.stage;
        if(data.event.hasOwnProperty('queryStrParams')) data.querystring = data.event.query;
        if(data.event.hasOwnProperty('path')) data.path = data.event.path;
        if(data.event.hasOwnProperty('identity')) data.identity = data.event.identity;
        if(data.event.hasOwnProperty('stageVariables')) data.stageVariables = data.event.stageVariables;
        return data;
    }

    // API Gateway Proxy
    if(data.event.hasOwnProperty('pathParameters') && data.event.hasOwnProperty('proxy')) {
        console.log("API Gateway Proxy Event Type");

        // No Sanitization or Transform - may need to look at this
        data[EVENT_TYPE] = EVENT_API_GW_PROXY;
        return data;
    }

    // S3
    if (data.event.hasOwnProperty('Records')
        && data.event.Records.length > 0
        && data.event.Records[0].hasOwnProperty('eventSource')
        && data.event.Records[0].eventSource === 'aws:s3') {
        data.s3 = data.event.Records[0];
        data[EVENT_TYPE] = EVENT_S3;
        return data;
    }

    // SNS
    if (data.event.hasOwnProperty('Records')
        && data.event.Records.length > 0
        && data.event.Records[0].hasOwnProperty('eventSource')
        && data.event.Records[0].eventSource === 'aws:sns') {
        data.sns = data.event.Records[0];
        data[EVENT_TYPE] = EVENT_SNS;
        return data;
    }

    // SES
    if (data.event.hasOwnProperty('Records')
        && data.event.Records.length > 0
        && data.event.Records[0].hasOwnProperty('eventSource')
        && data.event.Records[0].eventSource === 'aws:ses') {
        // Need to check this one to see if there is more info that I will need than just mail
        data.mail = data.event.Records[0].ses.mail;
        data[EVENT_TYPE] = EVENT_SES;
        return data;
    }

    // DynamoDB Streams - Probably not doing DynamoDB Streams - synchronous with error retries
    if (data.event.hasOwnProperty('Records')
        && data.event.Records.length > 0
        && data.event.Records[0].hasOwnProperty('eventSource')
        && data.event.Records[0].eventSource === 'aws:dynamodb') {
        // here we can get multiple record images depending on how the record is being pulled
        data.dynamodb = data.event.Records[0].dynamodb;

        // Most likely interested in the "NewImage"(record looks like after the change or add)
        // data.newRecord = data.event.Records[0].dynamodb.hasOwnProperty('NewImage');
        // data.oldRecord = old record
        // data.deletedRecord = delete
        data[EVENT_TYPE] = EVENT_DYNAMO_DB;
        return data;

    }

    /*
     // NOT PART OF THE CORE STACK - Consider removing...
     // CODE COMMIT
     if (data.event.hasOwnProperty('Records')
     && data.event.Records.length > 0
     && data.event.Records[0].hasOwnProperty('eventSource')
     && data.event.Records[0].eventSource === 'aws:codecommit') {
     console.log("Unimplemented CodeCommit Event Type");
     setContinueSeries(data,false);
     return Promise.resolve(data);

     }

     // Kinesis
     if (data.event.hasOwnProperty('Records')
     && data.event.Records.length > 0
     && data.event.Records[0].hasOwnProperty('eventSource')
     && data.event.Records[0].eventSource === 'aws:kinesis'
     ) {
     console.log("Unimplemented Kinesis Event Type");
     setContinueSeries(data,false);
     return Promise.resolve(data);
     }
     */

    // Need to investigate these - they are not using eventSource - need to see if this is correct or not
//        if (record.approximateArrivalTimestamp) return 'isKinesisFirehose';
//        if (event.deliveryStreamArn && event.deliveryStreamArn.startsWith('arn:aws:kinesis:')) return 'isKinesisFirehose';
//        if (record.cf) return 'isCloudfront';
}


/*
 // CloudFormation
 if(data.event.hasOwnProperty('StackId') && data.event.hasOwnProperty('RequestType') && data.event.hasOwnProperty('ResourceType')) {
 console.log("Unimplemented CloudFormation Event Type");
 setContinueSeries(data,false);
 return Promise.resolve(data);
 }



 // API Gateway Authorizer
 if(data.event.hasOwnProperty('authorizationToken')) {
 console.log("Unimplemented ApiGatewayAuthorizer Event Type");
 setContinueSeries(data,false);
 return Promise.resolve(data);
 }

 // AWS Config
 if(data.event.hasOwnProperty('configRuleId') && data.event.hasOwnProperty('configRuleName') && data.event.hasOwnProperty('configRuleArn')) {
 console.log("Unimplemented AwsConfig Event Type");
 setContinueSeries(data,false);
 return Promise.resolve(data);
 }

 // Scheduled Event - Not sure about this one, need to check it
 if(data.event.hasOwnProperty('source') && data.event.source === 'aws.events') {
 console.log("Unimplemented ScheduledEvent Event Type");
 setContinueSeries(data,false);
 return Promise.resolve(data);
 }

 // CloudWatch
 if(data.event.hasOwnProperty('awslogs') && data.event.awslogs.hasOwnProperty('data')) {
 console.log("Unimplemented CloudWatch Event Type");
 setContinueSeries(data,false);
 return Promise.resolve(data);
 }

 // Cognito Sync Trigger
 if(data.event.hasOwnProperty('eventType')
 && data.event.eventType === 'SyncTrigger'
 && data.event.hasOwnProperty('identityId')
 && data.event.hasOwnProperty('identityPoolId')) {
 console.log("Unimplemented Cognito Sync Trigger Event Type");
 setContinueSeries(data,false);
 return Promise.resolve(data);
 }

 // Mobile Backend
 if(data.event.hasOwnProperty('operation') && data.event.hasOwnProperty('message')) {
 console.log("Unimplemented MobileBackend Event Type");
 setContinueSeries(data,false);
 return Promise.resolve(data);
 }

 console.log("Unimplemented Event Type");
 setContinueSeries(data,false);
 return data;
 */



/**
 * Handler function to be invoked by AWS Lambda with an event
 *
 * @param {object} event - Incoming AWS Event.
 * @param {object} context - Lambda context object.
 * @param {object} callback - Lambda callback object.
 * @param {object} overrides - Overrides for the default data, including the configuration.
 */

/*
 //Old exports.handler - testing new flow
 exports.handler = function(event, context, callback, overrides) {

 // we will need to move the function series of steps to
 // individual calls, and implement some sort of flow control


 // we want to parse the event - we already have it, so this is synchronous


 // depending on the type of event, we will have different possible paths of execution
 var parsedEvent = exports.parseEvent(event);


 // get key to sign request to other services (if necessary)




 var steps = overrides && overrides.steps ? overrides.steps :
 [
 exports.parseEvent,
 exports.buildAccountObj,
 exports.createAccountRecord

 ];

 var data = {
 continueSeries: true,
 event: event,
 callback: callback,
 context: context,
 config: overrides && overrides.config ? overrides.config : defaultConfig,
 log: overrides && overrides.log ? overrides.log : console.log
 };
 Promise.series(steps, data)
 .then(function(data) {
 data.log({level: "info", message: "Process finished successfully."});
 var responseBody = {
 message: "Process finished successfully."
 };
 var response = {
 statusCode: 200,
 headers: {
 "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
 "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
 },
 body: JSON.stringify(responseBody)
 };
 //body: JSON.stringify(data)
 // return the results to caller (usually web request through api gateway)
 return data.callback(null, response);
 })
 .catch(function(err) {
 // When we throw an error on a lamdda that is attached to a stream (kenisis or dynamodb)
 // it will cause the queue of messages coming in from the stream to get stopped at that
 // point and our function will get called repeatedly -
 // this is to insure that messages are processed in order - We need to consider this in
 // our design - lambdas that use streams need to handle failure in a different way
 data.log({level: "error", message: "Step returned error: " + err.message,
 error: err, stack: err.stack});
 return data.callback(new Error("Error: Step returned error."));
 });
 };

 function setContinueSeries(data, val) {
 if (val) {
 data.continueSeries = true;
 } else {
 data.continueSeries = false;
 }
 return data;
 }

 Promise.series = function(promises, initValue) {
 return promises.reduce(function(chain, promise) {
 if (typeof promise !== 'function') {
 return Promise.reject(new Error("Error: Invalid promise item: " +
 promise));
 }
 return chain.then(promise);
 }, Promise.resolve(initValue));
 };
 */