export const  styles =  `
.morpherwallet-container {
  position: fixed;
  width: 0px;
  height: 0px;
  top: 0px;
	right: 0px;
	background: rgba(0, 0, 0, 0.30);
	
  z-index: 123123123123;
}

.hidden {
  display: none!important;
}
.close-button {
  border-radius: 8px;
  background: #FFF;
  display: inline-flex;
  padding: 8px;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  position: fixed;
  right: 20px;
  top: 20px;
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
	top: 80px;

  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(16, 24, 40, 0.06);
  border-radius: 8px;
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
@media (max-width: 768px) {
  .morpherwallet-widget-frame {
    top: 20px;
  }
}
`;

export const closeButton = `

  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

`