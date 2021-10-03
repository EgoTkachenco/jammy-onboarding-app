
import React, { Component, useRef, useEffect } from 'react';
import { Col, Row } from 'reactstrap';

import './Sensors.css'

const SensorBar = props => {

    const canvasRef = useRef(null)

    const drawBar = (ctx, value, max) => {
        const percents = value / max

        ctx.beginPath()
        ctx.fillStyle = '#C4C4C4'
        ctx.rect(2, 0, ctx.canvas.width - 4, ctx.canvas.height)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = '#00FF00'
        ctx.rect(2, ctx.canvas.height * (1 - percents), ctx.canvas.width - 4, ctx.canvas.height * percents)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = '#FF7171'
        ctx.rect(0, ctx.canvas.height / 2 - 2, ctx.canvas.width, 4)
        ctx.fill()

    }

    const draw = (ctx, value, max) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        drawBar(ctx, value, max)
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        let animationFrameId

        //Our draw came here
        const render = () => {
            draw(context, props.value, props.max)
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    })

    return <canvas ref={canvasRef} {...props} width='20px' height='150px' />
}


class Sensors extends Component {

    getValue = (string) => {
        const data = this.props.sensors.find((e) => e.string === string)
        return data === undefined ? 0 : data.value
    }

    getMax = (string) => {
        const data = this.props.sensors.find((e) => e.string === string)
        return data === undefined ? 0 : data.max
    }

    getBrightness = (string) => {
        const data = this.props.sensors.find((e) => e.string === string)
        return data === undefined ? 0 : data.brightness
    }

    render() {

        return (
            [0, 1, 2, 3, 4, 5].map((element) =>
                <Col className='sens' key={element}>
                    <Row>
                        <Col className='sens-cont justify-content-center' key={element}>
                            <Row className='sens-st'>{element + 1}</Row>
                            <Row className='sens-bar'>
                                <SensorBar value={this.getValue(element)} max={this.getMax(element)} />
                            </Row>
                        </Col>
                        <Col className='sens-val align-items-center'>
                            <Row>
                                {this.getValue(element)}
                            </Row>
                        </Col>
                    </Row>
                    <Row className='sens-br'>
                        {this.getBrightness(element)}
                    </Row>
                </Col>
            )
        );
    }
}

export default Sensors;
