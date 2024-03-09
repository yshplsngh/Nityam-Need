import React from 'react';
import HashLoader from 'react-spinners/HashLoader';

const Loading = () => {
  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // height:'100vh',
    zIndex:'999',
    // position:'sticky'
    // backgorundColor:'#92a8d1',
    // position:'absolute',
    // top:'50%',
    // left:'50%',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    // background: 'rgb(111,111,111,0.2)', // Here you choose the color and opacity that you want to apply
    // zndex: 9,
  };

  return (
    <div style={loadingStyle}>
      <HashLoader color="#008000" size={100} speedMultiplier={1} />
    </div>
  );
};

export default Loading;
