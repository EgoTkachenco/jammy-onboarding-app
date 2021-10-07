import React from 'react'
import { Col, Row } from 'reactstrap'

// import './NavigationMenu.css'

class NavigationMenu extends React.Component {
  constructor(props) {
    super(props)
    console.log('Launch with: ', props)
  }

  render() {
    return (
      <Col className="nav-menu">
        <Row
          className="nav-menu-header justify-content-md-center"
          style={{ background: this.props.test.color }}
        >
          {this.props.test.title}
        </Row>
        {this.props.test.menu.map((element) => (
          <Row
            key={element}
            onClick={() => this.props.onSelected(element)}
          >
            {element.id}. {element.title}
          </Row>
        ))}
      </Col>
    )
  }
}

function MenuItem(id, title, test) {
  return {
    id: id,
    title: title,
    test: test,
  }
}

export { NavigationMenu, MenuItem }
