import React, { Component, type ReactNode } from 'react';
export class PortalErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<main role="alert" style={{padding:'2rem'}}><h1>No se pudo mostrar el portal</h1><p>Ocurrió un problema al mostrar esta pantalla. Volvé a cargar para recuperar la sesión y los datos del servidor.</p><button onClick={()=>window.location.reload()}>Volver a cargar</button></main>:this.props.children;}
}
