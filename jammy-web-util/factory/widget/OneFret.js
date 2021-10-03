
import React, { Component, useRef, useEffect } from 'react';
import { Col, Row } from 'reactstrap';

import './Frets.css'

const Fret = props => {
    const canvasRef = useRef(null)
    const drawFret = (ctx, y, enabled) => {
        ctx.beginPath()
        ctx.fillStyle = enabled ? '#04BF00' : '#C4C4C4'
        ctx.arc(10, 0 + y, 7, 0, 2 * Math.PI, false)
        ctx.fill()
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }

    const draw = (ctx, active) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        ctx.beginPath()
        ctx.fillStyle = '#FFFFFF'
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fill()

        for (var i = 0; i < 6; i++) {
            drawFret(ctx, i * 22 + 16, active.includes(i))
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        let animationFrameId

        //Our draw came here
        const render = () => {
            draw(context, props.active)
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    })

    return <canvas ref={canvasRef} {...props} width='20px' height='140px' />
}

class OneFret extends Component {

    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
        super(props);
    }
    
    render() {
        return (
                <Col className='fret-cont'>
                    <Row className='fret' >
                        <Fret active={this.props.active ?? []} />
                    </Row>
                </Col>
        );
    }
}

export default OneFret;
