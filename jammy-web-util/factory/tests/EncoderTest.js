import React from 'react';
import { Col, Row } from 'reactstrap';
import midi from '../../../services/midi';
import ProgressIndicator from '../widget/ProgressIndicator';

import './Test.css'

class EncoderTest extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            rotatedClockwise: false,
            pushed: false,
            rotatedСounterclockwise: false,
        }
        this.startTest.bind(this.startTest)
    }

    async startTest() {
        this.props.onTestResult(false);
    }

    checkTest = () => {
        if (this.state.rotatedClockwise === true &&
            this.state.pushed === true &&
            this.state.rotatedСounterclockwise === true) {
            this.props.onTestResult !== undefined && this.props.onTestResult(true);
        }
    }

    midiMessageCallback = (event) => {
        console.log("Event: ", event.data);
        let data = event.data;
        if (data[0] === 0xB1 && data[1] === 0x06) {
            this.setState({
                pushed: true
            })
        } else if (data[0] === 0xB1 && data[1] === 0x07) {
            if (this.rotatedValue < data[2]) {
                this.setState({
                    rotatedClockwise: true
                })
            }else if(this.rotatedValue > data[2]){
                this.setState({
                    rotatedСounterclockwise: true
                })
            }
            this.rotatedValue = data[2]
        }

        this.checkTest()
    }

    componentDidMount() {
        midi.removeEventListener("midimessage", this.midiMessageCallback)
        midi.addEventListener("midimessage", this.midiMessageCallback)
    }

    componentWillUnmount() {
        midi.removeEventListener("midimessage", this.midiMessageCallback)
    }

    render() {
        return (
            <Col className='test'>
                <Row className='test-cont test-lb justify-content-md-center'>
                    <Col className={'stat rect ' + (this.state.rotatedClockwise === true ? 'enbl' : 'dis') + ' justify-content-md-center'}>
                        Rotate<br />Clockwise
                    </Col>
                    <Col className={'stat circ ' + (this.state.pushed === true ? 'enbl' : 'dis') + ' justify-content-md-center'}>
                        Push
                    </Col>
                    <Col className={'stat rect  ' + (this.state.rotatedСounterclockwise === true ? 'enbl' : 'dis') + '  justify-content-md-center'}>
                        Rotate<br />Сounterclockwise
                    </Col>
                </Row>
                <Row className='test-st justify-content-md-center'>
                    <ProgressIndicator />
                </Row>
            </Col>
        );
    }
}

export default EncoderTest;