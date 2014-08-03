define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'altair/plugins/node!speaker',
        'altair/plugins/node!lame',
        'altair/plugins/node!fs',
        'lodash'
], function (declare,
             Lifecycle,
             _AssertMixin,
             Speaker,
             lame,
             fs,
             _) {

    return declare([Lifecycle, _AssertMixin], {

        encoder: null,
        sound:   null,
        startup: function (options) {

            var _options    = options || this.options || {},
                encoder     = new lame.Encoder(_.defaults({
                // input
                channels: 2,        // 2 channels (left and right)
                bitDepth: 16,       // 16-bit samples
                sampleRate: 44100,  // 44,100 Hz sample rate

                // output
                bitRate: 128,
                outSampleRate: 22050,
                mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
            }, _options));

            this.encoder = encoder;
            this.sound   = _options.sound;

            this.assert(this.sound, 'You must pass { sound: "path/to/sound"} to a sound.');
            console.log('setting up sound', this.sound);

            return this.inherited(arguments);
        },

        play: function (options) {

            var dfd = new this.Deferred();

            fs.createReadStream(this.sound).pipe(this.encoder).on('format', function (format) {

                var speaker = new Speaker(_.defaults(options || {}, format));
                this.encoder.pipe(speaker);

            });

            return dfd;

        }


    });

});