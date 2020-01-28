import React from "react";
import logo from "./logo.svg";
import styled, { keyframes } from "styled-components";

const Wrapper = styled.div`
  text-align: center;
`;

const Header = styled.header`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const animation = keyframes`
from {
  transform: rotate(0deg);
}

to {
  transform: rotate(360deg);
}`;

const Img = styled.img`
  height: 40vmin;
  pointer-events: none;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${animation} infinite 2s linear;
  }
`;

const A = styled.a`
  color: #61dafb;
`;

const App: React.FC = () => {
  return (
    <Wrapper>
      <Header>
        <Img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <A href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </A>
      </Header>
    </Wrapper>
  );
};

export default App;
