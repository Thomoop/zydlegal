$(function () {
	if (document.location.hash) {
		let anchor = $('div[data-plugin=Blog] a.wb_anchor[name=' + document.location.hash.substring(1) + ']')
		if (anchor.length) {
			let offset = anchor.offset();
			if (offset.top) {
				window.scrollTo({top: offset.top, behavior: 'instant'})
			}
		}
	}
})


function wb_form_validateForm(formId, values, errors) {
	var form = $("input[name='wb_form_id'][value='" + formId + "']").parent();
	if (!form || form.length === 0 || !errors) return;

	form.find("input[name],textarea[name]").css({backgroundColor: ""});
	var elem;
	if (errors.required) {
		for (var i = 0; i < errors.required.length; i++) {
			var name = errors.required[i];
			elem = form.find("input[name='" + name + "'],textarea[name='" + name + "'],select[name='" + name + "']");
			elem.css({backgroundColor: "#ff8c8c"});
		}
	}

	if (Object.keys(errors).length) {
		for (var k in values) {
			elem = form.find("input[name='" + k + "'][type='radio'],input[name='" + k + "'][type='checkbox'],input[name='" + k + "[]'][type='checkbox']");
			if (elem.length) {
				if (!Array.isArray(values[k])) values[k] = [values[k]];
				elem.each(function (key, item) {
					if (values[k].indexOf($(item).val()) >= 0) {
						$(item).attr('checked', true);
					}
				})

				continue;
			}

			elem = form.find("input[name='" + k + "'],textarea[name='" + k + "'],select[name='" + k + "']");
			if (elem.length) {
				elem.val(values[k]);
			}
		}
	}
}

var _isTouchDevice;
function isTouchDevice() {
	if (_isTouchDevice === undefined) {
		_isTouchDevice = ('ontouchstart' in document.documentElement) && (
			navigator.userAgent.match(/Android/i)
			|| navigator.userAgent.match(/webOS/i)
			|| navigator.userAgent.match(/BlackBerry/i)
			|| navigator.userAgent.match(/Windows Phone/i)
			|| navigator.userAgent.match(/Opera Mini/i)
			|| navigator.userAgent.match(/IEMobile/i)
			|| navigator.userAgent.match(/iPhone/i)
			|| navigator.userAgent.match(/iPad/i)
			|| navigator.userAgent.match(/iPod/i)
			|| navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints > 0
		);
	}
	return _isTouchDevice;
}
var _baseUrl;
function getBaseUrl() {
	if (_baseUrl === undefined) {
		_baseUrl = $('base').attr('href');
	}
	return _baseUrl;
}
function isIOS() {
	return ('ontouchstart' in document.documentElement) && (
		navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints > 0
	);
}

function wb_show_alert(message, type) {
	var prompt = $("<div>")
		.addClass("alert alert-wb-form alert-" + type)
		.append(message)
		.prepend($("<button>").addClass("close")
			.html("&nbsp;&times;")
			.on("click", function() { $(this).parent().remove(); })
		)
	.appendTo("body");
	setTimeout(function() { prompt.animate({ opacity: 1, right: 0 }, 250); }, 250);
}

(function() {
	var popupInited = false;

	var loader, container, popup,
		iframe, closeBtn, isVisible;

	var setPopupVisible = function(visible) {
		isVisible = !!visible;
		if (isVisible) {
			container.show();
			setTimeout(function() { container.addClass('visible'); }, 10);
		} else {
			container.removeClass('visible');
			setTimeout(function() { container.hide(); }, 300);
		}
	};
	
	window.wb_close_popup = function() {
		if (iframe && iframe.length) {
			iframe.attr('src', '');
			setPopupVisible(false);
		}
	};

	window.wb_show_popup = function(url, width, height) {
		if (!popupInited) {
			popupInited = true;
			container = $('<div class="wb-popup-container">');
			popup = $('<div class="wb-popup">');
			loader = $('<div class="wb-popup-loader">').hide();
			$('<div class="ico-spin spinner">').appendTo(loader);
			var iframeWrapper = $('<div class="wb-iframe-wrapper">');
			iframe = $('<iframe>');
			closeBtn = $('<div class="wb-popup-btn-close">');
			closeBtn.on('click', wb_close_popup);
			popup.append(loader);
			popup.append(closeBtn);
			popup.append(iframeWrapper);
			iframeWrapper.append(iframe);
			popup.appendTo(container);
			container.appendTo('body');
			$(document).on('keydown', function(e) {
				if (e.keyCode === 27) { // Esc
					if (isVisible) wb_close_popup();
				}
			});
			if (isIOS()) {
				iframeWrapper.attr('style', '-webkit-overflow-scrolling: touch; overflow-y: auto;');
			}
		}
		width = width || 400;
		height = height || 320;
		loader.show();
		popup.css({ width: width + 'px', height: height + 'px' });
		iframe.on('load', function() {
			loader.hide();
		});
		iframe.attr('src', url);
		setPopupVisible(true);
	};

	$(window).on('message', function(e) {
		var eData = e.originalEvent.data;
		if (eData && typeof(eData) === 'object' && eData.data && typeof(eData.data) === 'object') {
			var event = eData.event, data = eData.data;
			if (event === 'wb_contact_form_sent') {
				var type = data.type ? data.type : 'success';
				if (data.state) wb_show_alert(data.state, type);
				if (type === 'success') {
					setPopupVisible(false);
				}
			}
			if (event === 'wb_show_popup') {
				var url = data.url;
				var width = data.width;
				var height = data.height;
				wb_show_popup(url, width, height);
			}
		}
	});
})();

(function() {
	var params = [];

	var i, part;
	var qs_parts = location.search.replace(/^\?/, '').split('&');
	for (i = 0; i < qs_parts.length; i++) {
		part = qs_parts[i].split('=');
		if (part.length === 2) {
			params[decodeURIComponent(part[0])] = decodeURIComponent(part[1]);
		}
	}

	window.wb_get_query_param = function(key) {
		return (key && (key in params)) ? params[key] : null;
	};
})();

$(function() {
	// fix for forms in Instagram browser
	if (navigator.userAgent.indexOf('Instagram') > -1) {
		$('form').each(function() {
			if (this.method && this.method.toLowerCase() === 'post'
					&& this.target && this.target === '_blank') {
				$(this).removeAttr('target');
			}
		});
	}
	
	(function() {
		var extractYoutubeId = function(url) {
			var id = null;
			if (/^https?:\/\/.*youtube.*/i.test(url)) {
				var parts = url.split('?');
				if (parts.length > 1) {
					var parts2 = parts[1].split('&');
					for (var i = 0; i < parts2.length; i++) {
						var keyVal = parts2[i].split('=');
						if (keyVal.length > 1) {
							if (keyVal[0] === 'v' && keyVal[1]) {
								id = keyVal[1];
								break;
							}
						}
					}
				}
			}
			else if (/^(?:https?:\/\/|)(www\.)?youtu\.be\/(.+)$/i.test(url)) {
				id = RegExp.$1;
			}
			else if (/(?:^|")(?:https?:\/\/|)(?:www\.)?youtube\.com\/(?:(?:embed\/)|(?:watch\?v=))(.+?)(?:"|$)/i.test(url)) {
				id = RegExp.$1;
			}
			if (id) {
				id = id.replace(/[^a-zA-Z0-9\_\-]/, '');
			}
			return id;
		};

		$('.wb_video_background').each(function() {
			var videoContainer = $(this);
			var isSite = videoContainer.is('.wb_site_video_background');
			var url = videoContainer.data('video'),
				start = videoContainer.data('start'),
				end = videoContainer.data('end');

			if (!start) start = 0;
			if (!end) end = null;

			if (url) {
				var youtubeVideoId = extractYoutubeId(url);
				if (youtubeVideoId) {
					if (!window.YT) {
						$.getScript('https://www.youtube.com/iframe_api');
					}
					var onAPIReady = window.onYouTubeIframeAPIReady;
					window.onYouTubeIframeAPIReady = function() {
						if (typeof(onAPIReady) === 'function') onAPIReady();

						var youtubeElementId = videoContainer.attr('id') + '_youtube_container';
						var player = $('<div class="wb-youtube-video">' +
											'<div class="youtube" id="' + youtubeElementId + '"></div>' +
										'</div>');
						videoContainer.append(player);
						var viewportCont = isSite ? $(window) : videoContainer;
						var lastWidth, lastHeight;
						var innerCont = null;
						var inited = false;
						var resizer = function() {
							if (!innerCont) innerCont = player.children('iframe.youtube');
							if (!innerCont.length) return;

							var w = viewportCont.width(),
								h = viewportCont.height();
							if (lastWidth === w && lastHeight === h)
								return;
							lastWidth = w; lastHeight = h;
							if (w / h > 16/9) {
								youtube.setSize(w, w / 16*9);
								innerCont.css('left', 0);
							} else {
								youtube.setSize(h / 9*16, h);
								innerCont.css('left', -(innerCont.outerWidth() - w) / 2);
							}
						};
						var onfocus = function() {
							if (youtube.getPlayerState() !== YT.PlayerState.PLAYING)
								youtube.playVideo();
						}
						$(window).on('resize', resizer);
						$(window).on('focus', onfocus);

						var initVideo = function(reload) {
							player.addClass('visible');
							clearInterval(timer);
							timer = setInterval(function() {
								youtube.seekTo(start);
								if (youtube.getPlayerState() !== YT.PlayerState.PLAYING)
									youtube.playVideo();
							}, ((end ? end : youtube.getDuration() - 0.5) - start) * 1000);
							if (reload) {
								youtube.seekTo(start);
								if (youtube.getPlayerState() !== YT.PlayerState.PLAYING)
									youtube.playVideo();
							}
						};

						var timer;
						var youtube = new YT.Player(youtubeElementId, {
							events: {
								playerVars: {
									autoplay: 0,
									autohide: 1,
									modestbranding: 0,
									rel: 0,
									showinfo: 0,
									controls: 0,
									disablekb: 1,
									enablejsapi: 0,
									iv_load_policy: 3
								},
								onReady: function() {
									youtube.loadVideoById({
										videoId: youtubeVideoId,
										startSeconds: start
									});
									youtube.mute();
									resizer();
								},
								onStateChange: function(e) {
									if (e.data === YT.PlayerState.PLAYING) {
										if (!inited) {
											initVideo();
											inited = true;
										}
									} else if (e.data === YT.PlayerState.ENDED) {
										initVideo(true);
									}
								}
							}
						});
					};
				}
				else {
					var video = $('<video class="wb-video" muted playsinline>');
					var loaded = false;
					var ratio;
					var lastWidth, lastHeight;
					videoContainer.append(video);

					var resizer = function() {
						if (!ratio) return;
						var ew = videoContainer.width();
						var eh = videoContainer.height();
						if (lastWidth && lastWidth === ew && lastHeight && lastHeight === eh)
							return;
						lastWidth = ew; lastHeight = eh;
						var er = ew / eh;
						var nw = 0, nh = 0, nl = 0, nt = 0;
						if (ratio > er) {
							nh = eh;
							nw = nh * ratio;
							nl = (nw - ew) / 2;
						} else if (ratio < eh) {
							nw = ew;
							nh = nw / ratio;
							nt = (nh - eh) / 2;
						} else {
							nw = ew;
							nh = eh;
						}
						video.css({width: nw, height: nh, left: -nl, top: -nt});
					};
					$(window).on('resize', resizer);

					video.get(0).autoplay = true;
					video.on('loadeddata', function() {
						if (loaded) return;
						loaded = true;
						setInterval(function() {
							video.get(0).currentTime = start;
							if (video.get(0).paused) video.get(0).play();
						}, ((end ? end : video.get(0).duration) - start) * 1000);
						video.get(0).currentTime = start;
						video.get(0).play();
						video.addClass('visible');
						ratio = (video.width() / video.height());
						resizer();
					});
					video.get(0).src = url;
				}
			}
		});
	})();

	var currLang = (('currLang' in window) && window.currLang) ? window.currLang : null;
	var useTrailingSlashes = (!('useTrailingSlashes' in window) || window.useTrailingSlashes);
	var disableRightClick = (('disableRightClick' in window) && window.disableRightClick);

	var isPopupMode = (parseInt(wb_get_query_param('wbPopupMode')) === 1);
	var openPopupPageUrl = (('openPopupPageUrl' in window) && window.openPopupPageUrl);
	var openPopupPageWidth = (('openPopupPageWidth' in window) && window.openPopupPageWidth);
	var openPopupPageHeight = (('openPopupPageHeight' in window) && window.openPopupPageHeight);

	var href = wb_get_query_param('wbPopupOpen');
	if (href) {
		var baseUrl = $('head base').attr('href');
		if (/^wb_popup:([^;]*);/.test(href)) {
			var url = RegExp.$1, w, h;
			var parts = href.split(';');
			for (var i = 0; i < parts.length; i++) {
				var pp = parts[i].split('=');
				if (pp.length !== 2 || !parseInt(pp[1])) continue;
				if (pp[0] === 'w') w = parseInt(pp[1]);
				else if (pp[0] === 'h') h = parseInt(pp[1]);
			}
			if (!/^https?:\/\//.test(url)) {
				url = baseUrl + url;
			}

			if (!isPopupMode) {
				wb_show_popup(url, w, h);
			} else if (window !== window.parent && window.parent.postMessage) {
				window.parent.postMessage({event: 'wb_show_popup', data: {url: url, width: w, height: h}});
			}
		}
	}

	if (disableRightClick) {
		$(document).on('contextmenu', function(e) { e.preventDefault(); });
	}
	
	var comboBoxes = $('.wb-combobox-controll');
	if (comboBoxes.length) {
		comboBoxes.each(function() {
			var thisCombo = $(this);
			var clickFunc = function() {
				var input = thisCombo.find('input');
				var menu = thisCombo.find('.dropdown-menu');

				var w = input.outerWidth();
				var mw = menu.width();
				var mh = menu.height();
				var ew = thisCombo.parent().outerWidth();
				var eh = thisCombo.parent().outerHeight();
				var wW = $(document.body).outerWidth();
				var wH = $(document.body).outerHeight();

				var offset = thisCombo.parent().offset();

				if (mw < ew) menu.width(ew);

				let margin = -w;
				if (document.dir === 'rtl') {
					if (mw > offset.left + ew) margin -= mw - ew;
				} else {
					if (offset.left + mw > wW) margin -= mw - ew;
				}

				let css = {};
				css[document.dir === 'rtl' ? 'marginRight' : 'marginLeft'] = margin + 'px';
				menu.css( css );

				if (offset.top + eh + mh > wH) menu.css( {top: 'initial', 'bottom': '100%' } );
				if (offset.top - mh < 0) menu.css( {top: '100%', 'bottom': 'initial' } );

				thisCombo.find('.btn-group').toggleClass('open');
			};
			$(this).find('input').bind('click', clickFunc);
			$(this).find('.dropdown-toggle').bind('click', clickFunc);
		});
		
		$(document).bind('click', function(e) {
			var t = $(e.target);
			if (!t.is('.wb-combobox-controll')) {
				t = t.parents('.wb-combobox-controll');
				$.each($('.wb-combobox-controll'), function() {
					if (t.get(0) !== $(this).get(0)) {
						$(this).find('.btn-group').removeClass('open');
					}
				});
			}
		});
	}
	if (currLang) {
		$('.lang-selector').each(function() {
			var thisElem = $(this);
			var type = thisElem.attr('data-type');
			if (type === 'flags') {
				thisElem.find('a[data-lang="' + currLang + '"]').addClass('active');
			} else if (type === 'select') {
				var actLi = thisElem.find('li[data-lang="' + currLang + '"]');
				actLi.addClass('active');
				thisElem.find('input').val(actLi.find('a').html());
			}
		});
	}
	$('.btn-group.dropdown').each(function() {
		var ddh = $(this).height();
		var ddm = $(this).children('.dropdown-menu');
		ddm.addClass('open');
		var ddmh = ddm.height();
		ddm.removeClass('open');
		var ddt = $(this).offset().top;
		var dh = $(document).height();
		if (ddt + ddh + ddmh + 2 >= dh) {
			$(this).removeClass('dropdown').addClass('dropup');
		}
	});

	/** @type SpMenu[] */
	var menuList = [];
	/** @type SpMenuItem|null */
	var lastOpenMi = null;
	/** @param {SpMenu} ignoreMenu */
	var closeMenus = function(ignoreMenu) {
		for (var i = 0; i < menuList.length; i++) {
			var menu = menuList[i];
			if (ignoreMenu && menu.menuId === ignoreMenu.menuId) continue;
			menu.closeAll();
		}
	};

	$('body').on('touchstart', function(e) {
		var ignoreMenu = SpMenu.lookupMenu($(e.target).closest('.wb-menu,.wb-menu-det'));
		closeMenus(ignoreMenu);
	});

	/**
	 * @param {JQuery} elem
	 * @param {SpMenu} parent
	 */
	var SpMenuItem = function(elem, parent) {
		this.elem = elem;
		this.parent = parent;
		this.subMenu = (elem.children('ul').length > 0)
			? new SpMenu(elem, this)
			: null;
		var isOver = false;
		this.isHover = function() { return isOver; };
		this.isActive = function() { return elem.is('.active'); };
		var linkElem = this.elem.children('a');
		var href = linkElem.attr('href');
		var clearAnchor = function(url) {
			var anchorPos = url.indexOf('#');
			return anchorPos > -1 ? url.substring(0, url.indexOf('#')) : url;
		};
		var itemOnCurrPage;
		this.isAnchor = function(onCurrentPage) {
			if (href.indexOf('#') > -1) {
				if (onCurrentPage !== undefined) {
					if (itemOnCurrPage === undefined) {
						var baseUrl = getBaseUrl();
						var currUrl = clearAnchor(location.href);
						var currUri = currUrl.replace(baseUrl, '');
						var itemUri = href.replace(baseUrl, '');
						itemOnCurrPage = (clearAnchor(itemUri) === currUri);
					}
					return itemOnCurrPage === !!onCurrentPage;
				}
				return true;
			}
			return false;
		};
		this.getText = function() { return linkElem.text(); }
		var _hto = 0;
		this.setHover = function(over) {
			this.cancelHoverTimeout();
			if (isOver == over) return;
			isOver = over;
			if (over) {
				elem.addClass('over');
				if (isTouchDevice()) {
					// remove 'over' state from sibling items manually
					// because for touch devices mouseout is not called.
					var pItems = this.parent.getItems();
					for (var i=0; i < pItems.length; i++) {
						var item = pItems[i];
						if (item === this) continue;
						if (item.isHover()) item.setHover(false);
					}
				}
			} else {
				elem.removeClass('over');
			}
			if (this.subMenu) this.subMenu.triggerHover(over);
			if (this.parent && this.parent.isVertical() && this.parent.parent) {
				this.parent.parent.cancelHoverTimeout();
				if (!this.parent.isHover()) this.parent.parent.setHover(over);
			}
		};
		this.setHoverTimeout = function(over) {
			this.cancelHoverTimeout();
			var self = this;
			_hto = setTimeout(function() { self.setHover(over); }, 20);
		};
		this.cancelHoverTimeout = function() {
			if (_hto) clearTimeout(_hto);
		};
	};
	/**
	 * 
	 * @param {JQuery} elem
	 * @param {SpMenuItem|null} parent
	 */
	var SpMenu = function(elem, parent) {
		this.menuId = (parent && parent.parent) ? parent.parent.menuId : elem[0].id;
		this.parent = parent;
		SpMenu.markMenu(elem, this.menuId);
		var menuElem = elem.children('ul');
		var isVertical = menuElem.is('.vmenu');
		/** @type SpMenuItem[] */
		var items = [];
		var rawItem = menuElem.children('li');
		for (var i = 0, c = rawItem.length; i < c; i++) {
			var el = rawItem.eq(i);
			el.data('spMi', i);
			items.push(new SpMenuItem(el, this));
		}

		var fallbackActiveItem = null;
		var currentPageItems = menuElem.find("li.wb_this_page_menu_item");
		var anchorItemMap = {};
		currentPageItems.each(function() {
			var item = $(this);
			if( !fallbackActiveItem )
				fallbackActiveItem = item;
			var anchor = item.data("anchor") || "";
			if( !anchorItemMap.hasOwnProperty(anchor) ) {
				anchorItemMap[anchor] = item;
				anchorItemMap[encodeURIComponent(anchor)] = item;
				anchorItemMap[encodeURIComponent(anchor).replace(/%20/g, '+')] = item;
			}
		});

		/** @type JQuery|null */
		var _wrapperElem = null;
		var _wrapper = false;
		this.isWrapper = function() { return this._wrapper ? true : false; };
		/**
		 * @param {boolean} wrapper
		 * @param {SpMenuItem} mi
		 */
		this.setWrapper = function(wrapper, mi) {
			if (_wrapper == wrapper) return;
			_wrapper = wrapper;
			if (wrapper) {
				if (!_wrapperElem) {
					_wrapperElem = $('<div>')
						.addClass('vmenu wb-menu-det')
						.attr({id: this.menuId + '-det'})
						.css({
							position: 'absolute',
							zIndex: 9999,
							top: -20,
							left: -20,
							width: 1
						})
						.appendTo(document.body);
					SpMenu.markMenu(_wrapperElem, this.menuId);
				}
				var pos = mi.elem.offset();
				var width = mi.elem.outerWidth();
				_wrapperElem.css({
					left: pos.left + width - 1,
					top: pos.top
				});
				_wrapperElem.append(menuElem);
			} else {
				elem.append(menuElem);
			}
		};
		this.triggerHover = function(over, mi) {
			if (!over) this.setWrapper(false, mi);
		};
		
		this.isVertical = function() {
			if (!this.parent) {
				return isVertical;
			} else if (this.parent.parent) {
				return this.parent.parent.isVertical();
			}
			return false;
		};

		var _openLeft = false;
		this.isOpenLeft = function() { return _openLeft; };
		this.setOpenLeft = function(openLeft) {
			if (_openLeft == openLeft) return;
			_openLeft = openLeft;
			if (openLeft) menuElem.addClass('open-left');
			else menuElem.removeClass('open-left');
		};

		this.getLeft = function() { return menuElem.offset().left; };
		this.getWidth = function() { return menuElem.outerWidth(true); };

		var isExpanded = function() { return elem.is('.collapse-expanded'); };

		var open = function() {
			elem.addClass('collapse-expanded');
			updateMenuPosition();
			if (isLanding) onResize();
		};
		var close = function() {
			elem.removeClass('collapse-expanded');
		};

		this.clearOpenLeft = function() {
			this.setOpenLeft(false);
			for (var i = 0; i < items.length; i++) {
				if (items[i].subMenu) items[i].subMenu.clearOpenLeft();
			}
		};
		this.closeAll = function() {
			for (var i = 0; i < items.length; i++) {
				var mi = items[i];
				mi.setHover(false);
				if (mi.subMenu) mi.subMenu.closeAll();
			}
		};
		this.getItems = function() {
			return items;
		};

		this.updateActiveItems = function(anchorsAbove, anchorsBelow) {
			if( currentPageItems.length < 2 ) {
				currentPageItems.addClass("active");
			}
			else {
				currentPageItems.removeClass("active");
				var searchFunc = function(anchorList) {
					for( var i = 0, il = anchorList.length; i < il; i++ ) {
						var anchor = anchorList[i];
						if( !anchorItemMap.hasOwnProperty(anchor.name) )
							continue;
						anchorItemMap[anchor.name].addClass("active");
						return true;
					}
					return false;
				};
				if( !searchFunc(anchorsAbove) )
					if( !searchFunc(anchorsBelow) ) // Fallback if there are no menu items pointing to an anchor above current window scroll position (including menu item without anchor).
						fallbackActiveItem.addClass("active"); // Fallback when menu has only invalid items pointing to non-existing anchors.
			}
		};

		var isHover = false;
		this.isHover = function() {
			return isHover;
		};

		/**
		 * @param {SpMenuItem} mi
		 * @param {boolean} over
		 */
		var onHover = function(mi, over) {
			if (over) {
				mi.setHover(true);
				lastOpenMi = mi;
				
				if (isExpanded()) {
					mi.parent.clearOpenLeft();
				}
				else if (mi.subMenu) {
					var subLeft = mi.subMenu.getLeft();
					if (isVertical && mi.parent.isOpenLeft()) {
						mi.subMenu.setOpenLeft(true);
					}
					else {
						var ww = $(window).width();
						var miParentLeft = mi.parent.getLeft();
						var offset = (mi.parent && mi.parent.parent) ? mi.elem.width() : 0;
						var sw = mi.subMenu.getWidth();
						var miLeft = mi.elem.position().left;
						mi.subMenu.setOpenLeft(miParentLeft + miLeft + offset + sw > ww);
					}
					mi.subMenu.setWrapper(isVertical, mi);
				}
			}
			else {
				mi.setHoverTimeout(false);
			}
		};

		var onClick = function(mi) {
			if (mi.isAnchor(true)) {
				setTimeout(function() {
					close();
				}, 100);
			}
		};

		var self = this;
		/**
		 * 
		 * @param {SpMenuItem} mi
		 * @param {JQueryEventObject} e
		 */
		var onHoverToggle = function(mi, e) {
			var isOver = mi.isHover() || (isExpanded() && mi.isActive());

			closeMenus(self);
			var parentMatch = false;
			var mip = mi;
			while (true) {
				if (mip === lastOpenMi) {
					parentMatch = true;
					break;
				} else if (mip.parent) {
					mip = mip.parent;
				} else {
					break;
				}
			}
			if (lastOpenMi && !mi.parent && !parentMatch) {
				lastOpenMi.setHoverTimeout(false);
			}
			if (!isOver && mi.subMenu) {
				e.stopImmediatePropagation();
				e.preventDefault();
			}
			onHover(mi, !isOver);
		};

		/** @returns SpMenu|null */
		var inferMi = function(miElem) {
			var idx = miElem.data('spMi');
			if (typeof idx !== 'number' && typeof idx !== 'string') return null;
			if (idx < 0 || idx >= items.length) return null;
			return items[idx];
		};

		var ignoreHover = null;
		menuElem
			.on('mouseenter', function() {
				if (!self.parent) return;
				isHover = true;
			})
			.on('mouseleave', function() {
				if (!self.parent) return;
				isHover = false;
				var hasHoverChild = false;
				for (var i=0; i < items.length; i++) {
					var item = items[i];
					if (item.isHover()) {
						hasHoverChild = true;
						break;
					}
				}
				if (!hasHoverChild) {
					self.parent.setHover(false);
				}
			})
			.on('click', '> li', function() {
				var mi = inferMi($(this));
				onClick(mi);
			})
			.on('mouseover', '> li', function() {
				if (ignoreHover) return;
				var mi = inferMi($(this));
				if (!mi) return;
				onHover(mi, true);
			})
			.on('mouseout', '> li', function() {
				if (ignoreHover) return;
				var mi = inferMi($(this));
				if (!mi) return;
				onHover(mi, false);
			})
			.on('touchstart', '> li > a', function(e) {
				if (ignoreHover) clearTimeout(ignoreHover);
				ignoreHover = setTimeout(function() { ignoreHover = null; }, 2000);
				var mi = inferMi($(this).parent());
				if (!mi) return;
				onHoverToggle(mi, e);
			});
		if (!parent) SpMenu.registerMenu(this);
	};
	/** @type {[menuId: string]: SpMenu} */
	var menuIdx = {};
	/** @param {SpMenu} menu */
	SpMenu.registerMenu = function(menu) {
		menuList.push(menu);
		menuIdx[menu.menuId] = menu;
	};
	SpMenu.markMenu = function(elem, menuId) {
		elem.data('spMenu', menuId);
	};
	/**
	 * @param {JQuery} elem
	 * @returns {SpMenu|null}
	 */
	SpMenu.lookupMenu = function(elem) {
		var menuId = elem.data('spMenu');
		return (menuId in menuIdx) ? menuIdx[menuId] : null;
	};

	// Observe scrolling and body size change to correctly update active menu items with anchors.
	SpMenu.updateActiveItems = function() {
		var anchorsAbove = [], anchorsBelow = [];
		anchorsAbove.push({name: "", delta: $(window).scrollTop()});
		$("a.wb_anchor").each(function() {
			var $this = $(this);
			var anchor = $this.attr("name");
			var offset = Math.round(this.getBoundingClientRect().top);
			if( offset <= 3 )
				anchorsAbove.push({name: anchor, delta: -offset});
			else
				anchorsBelow.push({name: anchor, delta: offset});
		});
		var sortFunc = function(a, b) {
			if (a.delta === b.delta) {
				if (a.name === "") return -1;
				if (b.name === "") return 1;
				return 0;
			}
			return (a.delta < b.delta) ? -1 : 1;
		};
		anchorsAbove.sort(sortFunc);
		anchorsBelow.sort(sortFunc);
		for( var i = 0, il = menuList.length; i < il; i++ )
			menuList[i].updateActiveItems(anchorsAbove, anchorsBelow);
	};
	$(window).on("scroll orientationchange", SpMenu.updateActiveItems);
	if( "ResizeObserver" in window ) {
		(new ResizeObserver(SpMenu.updateActiveItems)).observe(document.body);
	}
	else {
		var lastBodyHeight = null;
		setInterval(function() {
			if( document.body.clientHeight !== lastBodyHeight ) {
				lastBodyHeight = document.body.clientHeight;
				SpMenu.updateActiveItems();
			}
		}, 500);
	}
	setTimeout(SpMenu.updateActiveItems, 0);

	$('.wb-menu').each(function() { new SpMenu($(this), null); });

	$('.wb-menu-mobile').each(function() {
		var elem = $(this);
		var btn = elem.children('.btn-collapser').eq(0);
		var isHeaderFixed = (elem.parents('.wb_header_fixed').length > 0);

		var onResize = function() {
			var ul = elem.children('ul');
			ul.css('max-height', ($(window).scrollTop() - ul.offset().top + $(window).height() - 20) + 'px');
		};
		
		var updateMenuPosition = function() {
			var box = elem[0].getBoundingClientRect();
			elem.children('ul:not(.vmenu)').css({
				top: box.bottom, // (btn.offset().top + btn.outerHeight() - $(window).scrollTop()) + 'px'
				'max-height': 'calc(98vh - ' + box.bottom + 'px)'
			});
		};
		
		btn.on('click', function(e) {
			if (elem.hasClass('collapse-expanded')) {
				elem.removeClass('collapse-expanded');
			} else {
				elem.addClass('collapse-expanded');
				updateMenuPosition();
				if (isHeaderFixed) onResize();
			}
		});
		$(document).on('click', function(e) {
			if (!$(e.target).is('#' + elem.attr('id') + ', #' + elem.attr('id') + ' *')) {
				if (elem.hasClass('collapse-expanded')) {
					elem.removeClass('collapse-expanded');
				}
				e.stopPropagation();
			}
		});

		$(window)
			.on("resize orientationchange", function() {
				if (elem.hasClass('collapse-expanded')) {
					elem.removeClass('collapse-expanded');
				}
				updateMenuPosition();
				if( isHeaderFixed )
					onResize();
			})
			.scroll(function() { updateMenuPosition(); });
		
		if( isHeaderFixed ) {
			elem.find('li').on('click', function() {
				elem.removeClass('collapse-expanded');
			});
		}
	});

	(function() {
		if (!(typeof window.IntersectionObserver === 'function')) return;
		var observer = new IntersectionObserver(function(entries) {
			for (var i = 0, c = entries.length; i < c; i++) {
				if (!entries[i].isIntersecting) continue;
				var elem = $(entries[i].target);
				if (elem.data('wbAnimEntry')) continue;
				(function(elem) {
					var time = elem.attr('data-wb-anim-entry-time') * 1.0;
					var delay = elem.attr('data-wb-anim-entry-delay') * 1.0;
					elem.removeAttr('data-wb-anim-entry-time');
					elem.removeAttr('data-wb-anim-entry-delay');
					var funcStart = function() {
						elem.data('wbAnimEntry', '1')
							.addClass('wb-anim-entry-on')
							.removeClass('wb-anim-entry');
					};
					if (delay) setTimeout(funcStart, delay * 1000); else funcStart();
					if (time && !elem.hasClass('loop')) {
						setTimeout(
								function() { elem.removeClass('wb-anim-entry-on'); },
								(delay * 1000 + time * 1000) + 40);
					}
				})(elem);
			}
		}, {});
		$('.wb-anim-entry').each(function() { observer.observe(this); });
	})();

	(function() {
		var $sticky = $(".wb-sticky");
		if( $sticky.length ) {
			var $anchors = $(".wb_anchor");
			var html = $('html').get(0);
			var $root = $(".root");
			var watcher = 0, retry = 0, lastSize;
			var stickyUpdateCalled = false;
			var stickyUpdate = function() {
				var clientWidth = html.clientWidth;
				var clientHeight = html.clientHeight;

				let padding = {paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0};
				$sticky.each(function() {
					var $this = $(this);
					var hAlign = $this.data("hAlign"), vAlign = $this.data("vAlign");
					if( !hAlign || !vAlign )
						return;
					var rect = this.getBoundingClientRect(), v;
					var margin = {
						top: ((v = parseFloat($sticky.css('margin-top'))) && !isNaN(v)) ? v : 0,
						bottom: ((v = parseFloat($sticky.css('margin-bottom'))) && !isNaN(v)) ? v : 0,
						left: ((v = parseFloat($sticky.css('margin-left'))) && !isNaN(v)) ? v : 0,
						right: ((v = parseFloat($sticky.css('margin-right'))) && !isNaN(v)) ? v : 0
					};
					if( (rect.top - margin.top) <= 0 && (Math.round(rect.bottom) + margin.bottom) >= clientHeight ) {
						if( hAlign === "left" )
							padding.paddingLeft = Math.max(padding.paddingLeft, Math.round(rect.right));
						else if( hAlign === "right" )
							padding.paddingRight = Math.max(padding.paddingRight, Math.round(clientWidth - rect.left));
					}
					else if( (rect.left - margin.left) <= 0 && (Math.round(rect.right) + margin.right) >= clientWidth ) {
						if( vAlign === "top" )
							padding.paddingTop = Math.max(padding.paddingTop, Math.round(rect.bottom));
						else if( vAlign === "bottom" )
							padding.paddingBottom = Math.max(padding.paddingBottom, Math.round(clientHeight - rect.top));
					}
				});

				$anchors.css({position: "relative", top: -padding.paddingTop});
				$root.css(padding);
				if (!stickyUpdateCalled) $root.addClass('root-padding-fixed');
				stickyUpdateCalled = true;
				return clientWidth + "," + clientHeight;
			};
			var animationWatcherFunc = function() {
				var size = stickyUpdate();
				if( size !== lastSize ) {
					retry = 0;
					watcher = requestAnimationFrame(animationWatcherFunc);
				}
				else if( ++retry <= 2 )
					watcher = requestAnimationFrame(animationWatcherFunc);
				else
					watcher = 0;
				lastSize = size;
			};
			var stickyUpdateCallback = function() {
				if( watcher )
					cancelAnimationFrame(watcher);
				lastSize = "";
				retry = 0;
				watcher = requestAnimationFrame(animationWatcherFunc);
			};

			$(window).on("resize orientationchange", stickyUpdateCallback);
			stickyUpdateCallback();
			lastSize = stickyUpdate();
		}
	})();

	(function() {
		var header = null, main = null, footer = null;
		$("#wb_root").children().each(function() {
			var $this = $(this);
			var id = "" + $this.attr("id");
			if( /^wb_header/.test(id) )
				header = $this;
			if( /^wb_main/.test(id) )
				main = $this;
			if( /^wb_footer/.test(id) )
				footer = $this;
		});

		var updateMainBlockHeight = function() {
			if (!isPopupMode && (!main || !header || !footer)) return;
			var mainMargins = main.outerHeight(true) - main.outerHeight(false);
			var minMainBlockHeight = window.innerHeight - mainMargins;
			if (!isPopupMode) {
				var headerHeight = header.hasClass('wb_header_fixed') ? 0 : header.outerHeight(true);
				minMainBlockHeight = minMainBlockHeight - headerHeight - footer.outerHeight(true);
			}
			var mainBlockHeight = parseInt(main.get(0).style.height);
			if (!mainBlockHeight) mainBlockHeight = 0;
			main.css('min-height', Math.max(minMainBlockHeight, mainBlockHeight) + 'px');
		};
		$(window).on('resize', updateMainBlockHeight);
		$(window).on('load', updateMainBlockHeight)
		updateMainBlockHeight();
		setTimeout(function() { updateMainBlockHeight(); }, 100);
		setTimeout(function() { updateMainBlockHeight(); }, 300);
		setTimeout(function() { updateMainBlockHeight(); }, 1000);
	})();

	$(window).trigger('hashchange');

	$(document).on('mousedown', '.ecwid a', function() {
		var href = $(this).attr('href');
		if (href && href.indexOf('#!') === 0) {
			var url = decodeURIComponent(location.pathname) + href;
			$(this).attr('href', url);
		}
	});
	
	(function() {
		$('.wb_anchor').each(function() {
			try {
				var anchor = $(this);
				var target = $('[href="#' + this.name + '"]');
				if (!target.length)
					target = $('[href="#' + decodeURIComponent(this.name) + '"]');
				if (!target.length)
					target = $('[href="#' + encodeURIComponent(this.name) + '"]');
				if (target.length) {
					target.each(function() {
						$(this).on('click', function() {
							$(window).scrollTop(anchor.offset().top);
						});
					});
				}
			} catch (e) {}
		});
	})();
	
	(function() {
		var recaptchaList = $('.wb_form_captcha');
		var defaultRecaptchaWidth = 304;
		if (recaptchaList.length) {
			var resizeCaptcha = function() {
				recaptchaList.each(function() {
					var recaptcha = $(this);
					if (recaptcha.is(':visible')) {
						var form = recaptcha.parents('.wb_form');
						var fw = form.outerWidth();
						var scale = Math.min(fw / defaultRecaptchaWidth, 1);
						var scaleCss = 'scale(' + scale + ')';
						if (scale > 0) {
							recaptcha.css({
								'transform': scaleCss,
								'-o-transform': scaleCss,
								'-ms-transform': scaleCss,
								'-moz-transform': scaleCss,
								'-webkit-transform': scaleCss,
								'max-width': (fw * scale) + 'px'
							});
						}
					}
				});
			};
			$(window).on('resize', resizeCaptcha);
			setTimeout(function() {
				resizeCaptcha();
			}, 500);
		}
	})();

	(function() {
		var updatePositionFixed = function() {
			if (isTouchDevice()) {
				if (isIOS() && !window.MSStream) {
					$('body').addClass('wb_no_bg_fixed');
				}
				var pageCssSheet, sheet;
				for (var i = 0; i < document.styleSheets.length; i++) {
					sheet = document.styleSheets[i];
					if (sheet.ownerNode && sheet.ownerNode.getAttribute('id') === 'wb-page-stylesheet') {
						pageCssSheet = sheet; break;
					}
				}
				if (!pageCssSheet) return;
				
				var rules = (!pageCssSheet.href || pageCssSheet.href.indexOf(location.origin) > -1)
						? (pageCssSheet.cssRules || pageCssSheet.rules) : [];
				if (!rules) return;
				
				var fixedBgCss;
				for (i = 0; i < rules.length; i++) {
					if (rules[i].selectorText === 'body.site::before') {
						if (/\bfixed\b/i.test(rules[i].cssText)) {
							fixedBgCss = rules[i].cssText;
							pageCssSheet.deleteRule(i);
							break;
						}
					}
				}
				if (fixedBgCss) {
					var css = fixedBgCss.match(/\{(.+)\}/)[1].replace(/\bfixed\b/i, 'scroll');
					css += ' position: fixed';
					$('<div class="wb_fixed_bg_hack">').prependTo('body');
					pageCssSheet.addRule('.wb_fixed_bg_hack', css);
				}
			}
		};
		updatePositionFixed();
	})();

	(function() {
		var baseUrl = $('head base').attr('href');
		var convertLinks = function(link) {
			$(link || 'a[data-popup-processed!="true"]').each(function() {
				var a = $(this);
				var href = a.attr('href');
				if (/^wb_popup:([^;]*);/.test(href)) {
					var url = RegExp.$1, w, h;
					var parts = href.split(';');
					for (var i = 0; i < parts.length; i++) {
						var pp = parts[i].split('=');
						if (pp.length !== 2 || !parseInt(pp[1])) continue;
						if (pp[0] === 'w') w = parseInt(pp[1]);
						else if (pp[0] === 'h') h = parseInt(pp[1]);
					}
					if (!/^https?:\/\//.test(url)) {
						url = baseUrl + url;
					}

					(function(url, w, h) {
						var func = function(e) {
							e.stopImmediatePropagation();
							e.preventDefault();

							if (!isPopupMode) {
								wb_show_popup(url, w, h);
							} else if (window !== window.parent && window.parent.postMessage) {
								window.parent.postMessage({event: 'wb_show_popup', data: {url: url, width: w, height: h}});
							}
						};
						a.data("wbpopfunc", func).on('click', func);
					})(url, w, h);
					a.attr('data-popup-url', a.attr('href'));
					a.attr('href', 'javascript:void(0)');
					a.removeAttr('target');
					a.attr('data-is-popup', 'true');
				}
				else if (isPopupMode) {
					var target = a.attr('target');
					if (!target || target === '_self') {
						a.attr('target', '_parent');
					}
				}
				a.attr('data-popup-processed', 'true');
			});
		};
		convertLinks();
		setTimeout(convertLinks, 100);
		if (window.wbmodGalleryLib) {
			setTimeout(function() {
				var galleryList = window.wbmodGalleryLib.getGalleryLibList();
				for (var i=0; i < galleryList.length; i++) {
					galleryList[i].onImageDisplayed = function() {
						convertLinks();
					};
				}
			}, 500);
		}
		
		if (openPopupPageUrl && !isPopupMode) {
			setTimeout(function() {
				wb_show_popup(openPopupPageUrl, openPopupPageWidth, openPopupPageHeight);
			}, 1000);
		}

		window.initLink = function(link) {
			var $link = $(link);
			var func = $link.data("wbpopfunc");
			if( func )
				$link.off("click", func); // make sure that event is no longer listened since store gallery reuses same link element
			$link.removeAttr("data-popup-processed").removeAttr("data-is-popup");
			convertLinks(link);
		};
	})();

	(function() {
		$("[data-enlarge-src]").css("cursor", "pointer").on("click touchstart touchend touchmove", function(e) {
			var $this = $(this);
			if (e.type === "touchstart") {
				$this.data("pswpDisabled", false);
			} else if (e.type === "touchmove") {
				$this.data("pswpDisabled", true);
			}
			if ((e.type === "click" || e.type === "touchend") && !$(this).data("pswpDisabled")) {
				if ($this.data("clicked")) return;
				$this.data("clicked", true);
				var img = new Image();
				img.onload = function() {
					(new PhotoSwipe($('body > .pswp').get(0), PhotoSwipeUI_Default, [{
						src: this.src,
						w: this.width,
						h: this.height,
						msrc: this.src
					}], { index: 0 })).init();
					$this.data("clicked", false);
				};
				img.src = $this.attr("data-enlarge-src");
			}
		});
	})();

	(function() {
		var ignoreTags = ["A", "FORM", "INPUT", "SELECT", "TEXTAREA"];
		$(".wb-layout-link").each(function() {
			var $link = $(this);
			$link.parent().children(".wb_content").on("click", function(e) {
				for( var target = e.target; target && target !== this; target = target.parentNode ) {
					if( ignoreTags.indexOf(target.tagName) >= 0 || /wb-prevent-layout-click/.test(target.getAttribute("class") || "") )
						return;
				}
				// $link.click();
				e.stopImmediatePropagation();
				e.preventDefault();
				var href = $link.attr("href");
				if( href.indexOf(":") < 0 ) {
					var baseUrl = $("base").attr("href");
					href = baseUrl + href;
				}
				if( href === "javascript:void(0)" )
					$link.click();
				else if( $link.attr("target") === "_blank" || (e.type === "click" && (e.button === 1 || e.ctrlKey)) || ("wbPreview" in window && window.wbPreview && window.location.protocol === "https:" && /http:/.test(href)) )
					window.open(href, void 0, "noopener");
				else
					window.location.href = href;
			});
		});
	})();

	(function() {
		if ((typeof window.IntersectionObserver === 'function')) {
			var observer = new IntersectionObserver(function(entries) {
				for (var i = 0, c = entries.length; i < c; i++) {
					if (!entries[i].isIntersecting) continue;
					/** @type {HTMLElement} */
					var elem = entries[i].target;
					var src = elem.getAttribute('data-src');
					if (src) {
						elem.removeAttribute('data-defer-load');
						elem.removeAttribute('data-src');
						elem.src = src;
					}
				}
			}, {});
			$('[data-defer-load]').each(function() { observer.observe(this); });
		} else {
			$('[data-defer-load]').each(function() {
				/** @type {HTMLElement} */
				var elem = this;
				var src = elem.getAttribute('data-src');
				if (src) {
					elem.removeAttribute('data-defer-load');
					elem.removeAttribute('data-src');
					elem.src = src;
				}
			});
		}
	})();

	(function() {
		// Apply smooth scrolling with the delay.
		// This is because if the page is opened with an anchor,
		// then it starts scrolling with a big delay, waiting
		// for the page to completely load.
		setTimeout(function() {
			$('html').css('scroll-behavior', 'smooth');
		}, 500);
	})();
});
