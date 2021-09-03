export const  styles =  `
.morpherwallet-container {
  position: fixed;
  width: 0px;
  height: 0px;
  top: 0px;
	right: 0px;
	background: radial-gradient(50% 50% at 50% 50%,rgba(255,255,255,.45) 0,rgba(255,255,255,.72) 100%);
	
  z-index: 123123123123;
}
@media (max-width: 576px) {
  .morpherwallet-container {
    bottom: 0;
    top: auto;
  }
}
.morpherwallet-widget-frame {
	display: block;
	max-width: 414px;
	height: 600px!important;
	width: 80%;
	position: fixed;
	left: 50%;
	transform: translate(-50%, 0);
	top: 20px;

  box-shadow: 0 0 30px rgba(0,0,0,.3);
  border-radius: 14px;
	overflow: hidden;
	border: 0;
	margin-left: auto;
	margin-right: auto;
  z-index: 123123123123;
}
@media (max-width: 576px) {
  .morpherwallet-widget-frame {
    width: 90%;
  }
}
@media (max-height: 600px) {
  .morpherwallet-widget-frame {
    height: 90%!important;
  }
}
`;