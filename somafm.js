/*
 *  soma fm plugin for Movian Media Center
 *
 *  Copyright (C) 2012-2015 Henrik Andersson, lprot
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


(function(plugin) {
    var BASE_URL = "http://www.somafm.com";
    var logo = plugin.path + "somafm.png";
    var PREFIX = "somafm:";
    plugin.createService(plugin.getDescriptor().title, plugin.getDescriptor().id + ":start", "music", true, logo);

    function descr(s) {
        var tmp = s.match(/<p class="descr">([\S\s]*?)<dl>/);
        if (tmp) return tmp[1].replace("<!--","").replace("-->","").replace("</p>","").replace(/^\s+|\s+$/g, '');
        tmp = s.match(/<h1>([\S\s]*?)<\/h1>/);
        if (tmp) return tmp[1];
        return null;
    }

    plugin.addURI(PREFIX+"channel:(.*)url:(.*)", function(page, name,url) {
        var videoParams = {
        title: name,
        canonicalUrl: PREFIX + 'video:' + name,
        sources: [{
            url: url,
            mimetype: "xx",
        }],
        no_subtitle_scan: true,
        subtitles: []
        }
        page.source = 'audioparams:' + JSON.stringify(videoParams);
    }); 
    // Start page
    plugin.addURI(PREFIX+"BrowsebyArtist", function(page) {
	page.type = "directory";
	page.metadata.title = plugin.getDescriptor().title;
	page.metadata.logo = logo;
        page.loading = true;

        if (showtime.currentVersionInt < 49900000) {
   	    page.metadata.glwview = plugin.path + 'views/array.view';
	    page.contents = 'items';
            page.options.createInt('childTilesX', 'Tiles by X', 6, 1, 10, 1, '', function(v) {
                page.metadata.childTilesX = v;
            }, true);

            page.options.createInt('childTilesY', 'Tiles by Y', 2, 1, 4, 1, '', function(v) {
                page.metadata.childTilesY = v;
            }, true);

            page.options.createBool('informationBar', 'Information Bar', 1, function(v) {
                page.metadata.informationBar = v;
            }, true);
        } else
    	    page.model.contents = 'grid';

        var doc = showtime.httpReq(BASE_URL + "/listen").toString();

        // 1-id, 2-listeners, 3-icon, 4-title, 5-(description/now playing)
        var re = /<!-- Channel: (.*) Listeners: (.*) -->[\S\s]*?<img src="([\S\s]*?)"[\S\s]*?<h3>([\S\s]*?)<\/h3>([\S\s]*?)<\/li>/g;
        var match = re.exec(doc);
        while (match) {
	    page.appendItem(PREFIX + "channel:" + match[4] + "url:" + "http://ice1.somafm.com/" + match[1] + "-128-mp3", 'video', {
	        station: match[4],
	        title: match[4],
	        description: descr(match[5]),
	        icon: BASE_URL + match[3],
	        listeners: match[2]
	    });
            match = re.exec(doc);
        };
	page.loading = false;
    });

    plugin.addURI(PREFIX+"ppp", function(page) {
    page.appendItem(PREFIX + 'BrowsebyArtist', 'directory',{title: "Browse by Artist" });
    }); 

    plugin.addURI(plugin.getDescriptor().id + ':start', function(page) {
    page.appendItem(PREFIX + 'ppp', 'directory',{title: "ppp" });
    });
})(this);
