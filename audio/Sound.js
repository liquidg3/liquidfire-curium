define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/mixins/_AssertMixin',
        'altair/plugins/node!speaker',
        'altair/plugins/node!lame',
        'altair/plugins/node!arraystream',
        'altair/plugins/node!fs',
        'lodash'
], function (declare,
             Lifecycle,
             _AssertMixin,
             Speaker,
             lame,
             ArrayStream,
             fs,
             _) {

    return declare([Lifecycle, _AssertMixin], {

        decoder:        null,
        file:           null,
        preload:        false,
        _cachedSound:   null,
        _cachedFormat:  null,
        startup: function (options) {

            var _options    = options || this.options || {},
                decoder     = new lame.Decoder(_.defaults({
                // input
                channels: 2,        // 2 channels (left and right)
                bitDepth: 16,       // 16-bit samples
                sampleRate: 44100,  // 44,100 Hz sample rate

                // output
                bitRate: 128,
                outSampleRate: 22050,
                mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
            }, _options)),
                preload = _options.preload || this.preload;

            this.decoder = decoder;
            this.file   = _options.file;

            this.assert(this.file, 'you must select a file');

            if (preload) {
                this.deferred = this.loadSound().then(function () {
                    return this;
                }.bind(this));
            }

            this.assert(this.file, 'You must pass { file: "path/to/sound"} to a sound.');

            return this.inherited(arguments);

        },

        loadSound: function () {

            var dfd = new this.Deferred();

            this._cachedSound = [];

            fs.createReadStream(this.parent.resolvePath(this.file)).pipe(this.decoder)
                .on('error', this.hitch(dfd, 'reject'))
                .on('format', this.hitch(dfd, function (format) {
                    this._cachedFormat = format;
                }.bind(this)))
                .on('data', this.hitch(this._cachedSound, 'push'))
                .on('end', function () {

                dfd.resolve(this._cachedSound);

            }.bind(this));

            return dfd;

        },

        play: function (options) {

            var dfd = new this.Deferred(),
                stream,
                speaker;

            if(this._cachedSound) {

                stream  = ArrayStream.create(this._cachedSound);
                speaker = new Speaker(this._cachedFormat);
                stream.pipe(speaker);
                speaker.on('close', this.hitch(dfd, 'resolve'));

            } else {

                stream = fs.createReadStream(this.parent.resolvePath(this.file));

                stream.pipe(this.decoder).on('format', function (format) {

                    var speaker = new Speaker(_.defaults(options || {}, format));

                    this.decoder.pipe(speaker);

                    speaker.on('close', this.hitch(dfd, 'resolve'));

                }.bind(this));
            }


            return dfd;

        }


    });

});