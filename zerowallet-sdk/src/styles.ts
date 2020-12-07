export const  styles =  `
.zerowallet-container {
  position: fixed;
  width: 0px;
  height: 0px;
  top: 0px;
	right: 0px;
	background: radial-gradient(50% 50% at 50% 50%,rgba(255,255,255,.45) 0,rgba(255,255,255,.72) 100%);
	
  z-index: 123123123123;
}
@media (max-width: 576px) {
  .zerowallet-container {
    bottom: 0;
    top: auto;
  }
}
.zerowallet-widget-frame {
	display: block;
	max-width: 414px;
	max-height: 800px;
	height: 80%;
	width: 80%;
	margin-top: 20px;

  box-shadow: 0 0 30px rgba(0,0,0,.3);
  border-radius: 14px;
	overflow: hidden;
	border: 0;
	margin-left: auto;
	margin-right: auto;
  z-index: 123123123123;
}
@media (max-width: 576px) {
  .zerowallet-widget-frame {
    bottom: 0;
    top: auto;
		width: 100%;
		height: 100%;
    right: 0;
    left: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
`;