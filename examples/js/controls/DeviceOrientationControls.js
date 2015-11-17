/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */  
                                                   
THREE.DeviceOrientationControls = function ( object ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0; 
	   
	var onDeviceOrientationChangeEvent = function ( event ) {

		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function () {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function ( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler );                               // orient the device

			quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};
    var heading = 0;
	var rate = 0.8; 
	var headingSin = 0;
	var headingCos = 0; 
	var betaSin = 0;
	var betaCos = 0; 
	var gammaSin = 0;
	var gammaCos = 0;
	var headingDelay = 0;
	var betaDelay = 0;
	var gammaDelay = 0;
	
	this.update = function () {

		if ( scope.enabled === false ) return;
        
		
		
		if(scope.deviceOrientation.webkitCompassHeading) {
			heading = -scope.deviceOrientation.webkitCompassHeading;
		} else {
			heading = scope.deviceOrientation.alpha;
		}   
				
   	
		headingSin = rate * headingSin + (1-rate) * Math.sin(heading * (Math.PI / 180));
	    headingCos = rate * headingCos + (1-rate) * Math.cos(heading * (Math.PI / 180));
		headingDelay = Math.atan2(headingSin, headingCos) * (180 / Math.PI);  
		

		betaSin = rate * betaSin + (1-rate) * Math.sin(scope.deviceOrientation.beta * (Math.PI / 180));
	    betaCos = rate * betaCos + (1-rate) * Math.cos(scope.deviceOrientation.beta * (Math.PI / 180));
		betaDelay = Math.atan2(betaSin, betaCos) * (180 / Math.PI);
		
		gammaSin = rate * gammaSin + (1-rate) * Math.sin(scope.deviceOrientation.gamma * (Math.PI / 180));
	    gammaCos = rate * gammaCos + (1-rate) * Math.cos(scope.deviceOrientation.gamma * (Math.PI / 180));
		gammaDelay = Math.atan2(gammaSin, gammaCos) * (180 / Math.PI);
		

		var alpha  = headingDelay 	? THREE.Math.degToRad( headingDelay  ) 	 : 0;
		var beta   = betaDelay  	? THREE.Math.degToRad( betaDelay  ) 	 : 0; // X'
		var gamma  = gammaDelay 	? THREE.Math.degToRad( gammaDelay ) 	 : 0; // Y''
		var orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );

	};

	this.connect();

};
