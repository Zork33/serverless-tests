import Ydb from 'ydb-sdk';

const {Driver, StaticCredentialsAuthService} = Ydb;

async function run({user, password, database, endpoint}) {
    let driver;
    try {
        const authService = new StaticCredentialsAuthService(user, password, endpoint, {
            tokenExpirationTimeout: 20000,
        })

        driver = new Driver({endpoint, database, authService});
        try {
            await driver.ready(5000);
            console.log('Seem\'s like everything good');
            await driver.destroy()
            console.log('destroyed')
        } catch (e) {
            console.log(e)
            console.log('I found an error here, need to do something with this')
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('I did what I can, continue the process');
                    resolve();
                }, 1000)
            })
        }
    } catch (e) {
        console.log('Extra error handled')
    }
}

try {
    // valid params
    await run({
        user: 'root',
        password: 'passw0rd',
        database: '/local',
        endpoint: 'grpc://localhost:2136',
    });

    // invalid params
    // await run({
    //     user: 'root',
    //     password: 'passw0rd',
    //     database: '/local1',
    //     endpoint: 'grpc://localhost:2136',
    // });

    // test that function is valid
    // await test();
} catch (e) {
    console.log('Am here and I want to handle an error too: ', e)
}


// I left the same structure for better understanding
async function test() {
    try {
        try {
            throw new Error('Let\s initialise fake error')
        } catch (e) {
            console.log(e)
            console.log('I found an error here, need to do something with this')
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('I did what I can, continue the process');
                    resolve();
                }, 1000)
            })
        }
    } catch (e) {
        console.log('Extra error handled')
    }
}