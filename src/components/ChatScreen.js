import React, { Component } from 'react'
import Chatkit from '@pusher/chatkit-client'
import MessageList from './MessagesList'
import SendMessageForm from './SendMessageForm'
import WhosOnline from './WhosOnline'
import TypeIndicator from './TypeIndicator'

class ChatScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentUser: {},
            currentRoom: {},
            usersWhoAreTyping: [],
            messages: []
        }
        this.sendMessage = this.sendMessage.bind(this)
        this.sendTypingEvent = this.sendTypingEvent.bind(this)
    }

    sendMessage(text) {
        this.state.currentUser.sendMessage({
            text,
            roomId: this.state.currentRoom.id,
        })
    }

    sendTypingEvent() {
        this.state.currentUser
            .isTypingIn({ roomId: this.state.currentRoom.id })
            .catch(error => console.error('error', error))
    }

    componentDidMount () {
        const chatManager = new Chatkit.ChatManager({
            instanceLocator: 'v1:us1:d50ede12-f3df-4727-947a-7b1cff0ad623',
            userId: this.props.currentUsername,
            tokenProvider: new Chatkit.TokenProvider({
                url: 'http://localhost:3001/authenticate'
            }),
        })

        chatManager
            .connect()
            .then(currentUser => {
                this.setState({ currentUser })
                return currentUser.subscribeToRoom({
                    roomId: "27872571",
                    messageLimit: 100,
                    hooks: {
                        onMessage: message => {
                            this.setState({
                                messages: [...this.state.messages, message],
                            })
                        },
                        onUserStartedTyping: user => {
                            this.setState({
                                usersWhoAreTyping: [...this.state.usersWhoAreTyping, user.name],
                            })
                        },
                        onUserStoppedTyping: user => {
                            this.setState({
                                usersWhoAreTyping: this.state.usersWhoAreTyping.filter(
                                    username => username !== user.name
                                )
                            })
                        },
                        onPresenceChange: () => this.forceUpdate(),
                    },
                })
            })
            .then(currentRoom => {
                this.setState({ currentRoom })
            })
            .catch(error => console.error('error', error))
    }
    render() {
        const styles = {
            container: {
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            },
            chatContainer: {
                display: 'flex',
                flex: 1,
            },
            whosOnlineListContainer: {
                width: '300px',
                flex: 'none',
                padding: 20,
                backgroundColor: '#2c303b',
                color: 'white',
            },
            chatListContainer: {
                padding: 20,
                width: '85%',
                display: 'flex',
                flexDirection: 'column',
            },
            chatList: {
                borderTop: '1px solid grey',
            },
        }
        return (
            <div style={styles.container}>
                <div style={styles.chatContainer}>
                    <aside style={styles.whosOnlineListContainer}>
                        <WhosOnline
                            currentUser={this.state.currentUser}
                            users={this.state.currentRoom.users}
                        />
                    </aside>
                    <section style={styles.chatListContainer}>
                        <MessageList
                            messages={this.state.messages}
                            style={styles.chatList} />
                        <TypeIndicator usersWhoAreTyping={this.state.usersWhoAreTyping} />
                        <SendMessageForm onSubmit={this.sendMessage} onChange={this.sendTypingEvent} />
                    </section>
                </div>
            </div>
        )
    }
}

export default ChatScreen