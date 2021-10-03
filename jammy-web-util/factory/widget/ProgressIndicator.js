
import React, { Component } from 'react';
import { Spinner } from 'reactstrap';

class ProgressIndicator extends Component {
    render() {
        return (
            <Spinner color="primary" style={{ width: '142px', height: '142px', border: '0.9em solid currentColor', borderRightColor: 'transparent' }} />
        );
    }
}

export default ProgressIndicator;