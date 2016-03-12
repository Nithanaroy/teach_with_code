import React from 'react'
import $ from "jquery";
// import BLOCKTYPE from './constants';

let App = React.createClass({
  getInitialState: function() {
    return {blocks: [{"type": "code", "owner": "Nithanaroy", "repo": "learning_react", "commit": "d15583f92190b28741b177b9a51ec32c034504a0"}]};
  },
  handleNewBlock: function(block) {
    let blocks = this.state.blocks;
    let newBlocks = blocks.concat([block]);
    // TODO: Save to server
    this.setState({blocks: newBlocks});
  },
  render: function() {
    let blockNodes = this.state.blocks.map(function(block) {
      if(block.type === 'code') {
        return (
          <Code key={block.commit} owner={block.owner} repo={block.repo} commit={block.commit} />
        );
      }
      else if(block.type === 'text') {
        return (
          <div>
            <p>This is a text block </p>
          </div>
        )
      }
      return null;
    });


    return (
      <div>
        {blockNodes}
        <Form onFormSubmit={this.handleNewBlock} />
      </div>
    );
  }
});

App.propTypes = {} // data types and validations for each property
App.defaultProps = {} // default property values

class Code extends React.Component {
  constructor() {
    super();
    this.state = {code: ''}
  }
  componentDidMount() {
    this.getCommitService(this.props.owner, this.props.repo, this.props.commit);
  }
  getCommitService(owner, repo, commit) {
    $.ajax({
      method: 'GET',
      url: 'http://localhost:3000/api/commit_mock',
      data: {owner, repo, commit},
      cache: false,
      success: function(data) {
        this.setState({'code': data.files[0].patch});
      }.bind(this)
    })
  }
  render() {
    return (
      <div className='code-box'>
        <h1 className='code-box-header'>Code</h1>
        <pre className="prettyprint"><code className="language-js" data-lang="javascript">{this.state.code}</code></pre>
      </div>
    );
  }
}

var Form = React.createClass({
  getInitialState: function() {
    return {owner: '', repo: '', commit: ''};
  },
  handleNewCodeBlock: function(e) {
    e.preventDefault();
    let block = Object.assign({}, {type: 'code'}, this.state);
    this.props.onFormSubmit(block);
    return false;
  },
  handleChange: function(e) {
    switch (e.target.id) {
      case 'owner':
        this.setState({owner: e.target.value});
        break;
      case 'repo':
        this.setState({repo: e.target.value});
        break;
      case 'commit':
        this.setState({commit: e.target.value});
        break;
      default:
    }
  },
  render: function() {
    return (
      <form onSubmit={this.handleNewCodeBlock}>
        <p>Owner:</p> <input id='owner' type='text' value={this.state.owner} />
        <p>Repository:</p> <input id='repo' type='text' value={this.state.repo} />
        <p>Commit SHA:</p> <input id='commit' type='text' value={this.state.commit} />
        <input type='submit' value='Render' />
      </form>
    );
  }
});

export default App
