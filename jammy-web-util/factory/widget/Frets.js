
import React, { Component, useRef, useEffect } from 'react';
import { Col, Row } from 'reactstrap';

import './Frets.css'

const Segments = props => {

    const canvasRef = useRef(null)

    const drawSegment = (ctx, y, enabled) => {
        ctx.beginPath()
        ctx.fillStyle = enabled ? '#04BF00' : '#C4C4C4'
        ctx.rect(0, 0 + y, 7, 10)
        ctx.rect(7, 6 + y, 4, 4)
        ctx.rect(11, 6 + y, 7, 10)
        ctx.fill()
    }

    const draw = (ctx, active) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        ctx.beginPath()
        ctx.fillStyle = '#FFFFFF'
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fill()

        for (var i = 0; i < 11; i++) {
            drawSegment(ctx, i * 12 + 2, active.includes(i))
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

class Frets extends Component {

    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
        super(props);
    }
    

    getActive = (fret) => {
        var active = [];
        const frets = this.props.frets;
        if (frets !== undefined) {
            const result = frets.find((element) => element.fret === fret);
            active = result ? result.active: [];
        }
        return active;
    }

    render() {

        return (
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((element) =>
                <Col className='fret-cont' key={element}>
                    <Row>{element + 1}</Row>
                    <Row className='fret' >
                        <Segments active={this.getActive(element)} />
                    </Row>
                </Col>
            )
        );
    }
}

export default Frets;
