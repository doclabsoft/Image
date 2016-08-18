goog.provide('DD.ui.Zoom.Constants');

DD.ui.Zoom.Constants = function(){};

/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_ZOOM = 0;
/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_ASPECT_WIDTH = 16;
/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_ASPECT_HEIGHT = 9;
/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_WIDTH = 480;
/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_HEIGHT =
    //=270
    DD.ui.Zoom.Constants.DEFAULT_WIDTH / DD.ui.Zoom.Constants.DEFAULT_ASPECT_WIDTH * DD.ui.Zoom.Constants.DEFAULT_ASPECT_HEIGHT;
/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_POSITION_X = 0;
/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_POSITION_Y = 0;
/**
 * @const
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_ANGLE = 90;

/**
 * @type {number}
 */
DD.ui.Zoom.Constants.FULL_ROTATION_ANGLE = 360;

/**
 * @type {number}
 */
DD.ui.Zoom.Constants.DEFAULT_SOUND_LEVEL = 0.8;