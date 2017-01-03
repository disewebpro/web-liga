import React from 'react'
import Header from '../components/Header'
import Link from 'next/link'

export default class MyPage extends React.Component {
  static async getInitialProps ({ req }) {
    return { user: req.user }
  }

  render () {
    if (this.props.user) {
      return (
        <div>
          <Header />
          <p>Hello {this.props.user.displayName} <img src={this.props.user.photos[1].value} alt='Your Avatar Image' /></p>
        </div>
      )
    } else {
      return (
        <div>
          <Header />
          <Link href="/auth/steam"><a>Log in with Steam</a></Link>
        </div>
      )
    }
  }
}