import React from 'react'

export default class Header extends React.Component {
  static async getInitialProps ({ req }) {
    return { user: req.user }
  }

  render () {
    if (this.props.user) {
      return (
        <div>
          <p>{this.props.user.displayName} <img src={this.props.user.photos[2].value} alt='Your Avatar Image' /></p>
        </div>
      )
    } else {
      return <p>Not logged in</p>
    }
  }
}