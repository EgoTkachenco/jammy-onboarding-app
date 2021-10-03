import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Alert,
} from "reactstrap";

import { sleep } from "../../services/utils";

import jammy from "../../services/jammy";

export class Status {
    static UNKNOWN = 0;
    static LOADING = 1;
    static SUCCESS = 2;
    static ERROR = 3;
}

export class TestState {
    static IDLE = 0;
    static PROGRESS = 1;
    static DONE = 2;
    static FAILED = 3;
}

class ConnectedCase extends Component {

    constructor(props) {
        super(props)
        this.state = {
            test: TestState.IDLE,
            connected: { status: Status.UNKNOWN },
            rightFwVersion: { status: Status.UNKNOWN, value: 0 },
            rightHwVersion: { status: Status.UNKNOWN, value: 0 },
        };
        this.startTests().then(() =>
            this.setState({
                test: TestState.DONE
            })
        );
    }



    async startTests() {
        this.setState({
            test: TestState.PROGRESS
        })
        await this.checkConnection();
        await this.checkFwVersion();
    }

    async checkConnection() {
        await sleep(3000);
        this.setState({
            connected: { status: Status.LOADING }
        });
        await sleep(3000);
        this.setState({
            connected: { status: Status.SUCCESS }
        });
    }

    async checkFwVersion() {
        let fw = await jammy.getFirmware()
        console.log(fw)
    }


    render() {
        return (
            <Container fluid="sm" >
                <Row>
                    <Col>
                        <TestStateContent test={this.state.test} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ConnectedStatus value={this.state.connected} />
                    </Col>
                </Row>
                <Row>                    <Col>
                    <Alert color="success">
                        Right firmware version: 12
                            </Alert>
                </Col>
                </Row>
                <Row>
                    <Col>
                        <Alert color="success">
                            Left firmware version:  13
                            </Alert>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Alert color="success">
                            Battery test: SUCCESS!
                            </Alert>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Alert color="success">
                            Accelerometer test: SUCCESS!
                            </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }
}


function TestStateContent(state) {
    console.log("Test state: ", state)
    if (state.test === TestState.IDLE) {
        return <Alert color="success">Test IDLE</Alert>;
    } else if (state.test === Status.SUCCESS) {
        return <Alert color="success">Test in Progress</Alert>;
    } else {
        return (null);
    }
}

function ConnectedStatus(value) {
    console.log("Connected status: ", value)
    if (value.status === Status.LOADING) {
        return <Alert color="success">Connecting to Jammy E...</Alert>;
    } else if (value.status === Status.SUCCESS) {
        return <Alert color="success">Connected to Jammy E Success!!!</Alert>;
    } else {
        return (null);
    }
}
export { ConnectedCase }