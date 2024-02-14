from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader

from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
from os import path

import gettext

import random

pdfmetrics.registerFont(TTFont('Vera', 'Vera.ttf'))
pdfmetrics.registerFont(TTFont('VeraBd', 'VeraBd.ttf'))
pdfmetrics.registerFont(TTFont('VeraIt', 'VeraIt.ttf'))
pdfmetrics.registerFont(TTFont('VeraBI', 'VeraBI.ttf'))


# DEFINE SETTINGS
# ==========================
settings= {
    'textStyles': {
        'title': ('VeraBd', 4, (0,0,0)), # font, size, color(R,G,B)
        'subtitle': ('VeraBd', 2.5, (0,0,0)),
        'contentB': ('VeraBd', 2, (0,0,0)),
        'content': ('Vera', 2, (0,0,0))
    },
    'boxStyles': {
        'bold': (1,(0,0,0),(1,1,1)),  # spessore, fill(R,G,B), stroke(R,G,B)
        'thin': (0.5,(0,0,0),(1,0,0)),
        'none': (0.0,(0,0,0),(1,1,1))
    },
    'page': {
        'size': A4, #size
        'top': 20, # margin top
        'left': 9, # margin left
        'pad': 1 # text pad from box
    },
    'svgpath': path.abspath(path.dirname(__file__))+'/svg_pattern/'
}

def frange(x, y, jump):
    while x < y:
        yield x
        x += jump

def random_color():
    return random.choice([
        (139, 0, 0), 
        (0, 100, 0),
        (0, 0, 139)
    ])

# PDF GENERATOR
# =================

class bdmsPdf():
   
    def __init__(self, profile, settings=settings):
        self.pdf = BytesIO()
        self.c = canvas.Canvas(
            self.pdf, 
            pagesize=settings['page']['size']
        )
        
        self.c.translate(mm,mm)
        self.width, self.height = settings['page']['size']
        self.settings = settings
        self.pStyles = None
        self.profile = profile
        self.lastPlotElev = None
        
    def setTextStyle(self, style):
        self.c.setFillColorRGB(
            *(self.settings['textStyles'][style][2])
        )
        self.c.setFont(
            self.settings['textStyles'][style][0], 
            self.settings['textStyles'][style][1]*mm
        )
        self.fs = self.settings['textStyles'][style][1]
    
    def setParagraphStyle(self, style, align):
        self.pStyle = ParagraphStyle(style)
        self.pStyle.alignment = align
        self.pStyle.fontSize = self.settings['textStyles'][style][1] * mm
        self.pStyle.fontName = self.settings['textStyles'][style][0]
        self.pStyle.textColor = colors.Color(*(self.settings['textStyles'][style][2]))
        self.pStyle.leading = 1.2 * self.settings['textStyles'][style][1] * mm
        
    def setBoxStyle(self, style):
        self.c.setLineWidth(
            self.settings['boxStyles'][style][0]
        )
        self.c.setStrokeColorRGB(
            *(self.settings['boxStyles'][style][1])
        )
        self.c.setFillColorRGB(
            *(self.settings['boxStyles'][style][2])
        )
           
    def drawLeftTextBox2(
        self, x, y, width, height, boxStyle,
        aTextStyle, atext, bTextStyle=None, btext=None
    ):
        
        ulx = settings['page']['left']*mm + x*mm
        uly = self.height - (settings['page']['top']*mm + y*mm)
        
        self.setBoxStyle(boxStyle)
        self.c.rect(ulx, uly, width*mm, -height*mm)
        
        aLen = self.c.stringWidth(
            atext + ': ', 
            self.settings['textStyles'][aTextStyle][0],
            self.settings['textStyles'][aTextStyle][1]
        )
        
        self.setTextStyle(aTextStyle)
        self.c.drawString(
            ulx + settings['page']['pad']*mm,
            uly - (height/2)*mm - self.fs,
            atext + ': '
        )
        
        self.setTextStyle(bTextStyle)
        self.c.drawString(
            ulx + aLen*mm + settings['page']['pad']*mm,
            uly - (height/2)*mm - self.fs,
            btext
        )
    
    def drawTextBox(
        self, x, y, width, height, boxStyle, textStyle, atext, halign
    ):
        
        ulx = settings['page']['left']*mm + x*mm
        uly = self.height - (settings['page']['top']*mm + y*mm)
        
        self.setBoxStyle(boxStyle)
        self.c.rect(ulx, uly, width*mm, -height*mm)
        
        self.setTextStyle(textStyle)
        
        if halign == 'center':
            self.c.drawCentredString(
                ulx + (width/2)*mm,
                uly - (height/2)*mm - self.fs,
                atext
            )
        elif halign == 'left':
            self.c.drawString(
                ulx + settings['page']['pad']*mm,
                uly - (height/2)*mm - self.fs,
                atext
            )
        else:
            raise ValueError('halign only support center')
    
    def drawRightText(self, x, y, aTextStyle, atext):
        ulx = settings['page']['left']*mm + x*mm
        uly = self.height - (settings['page']['top']*mm + y*mm)
        
        self.setTextStyle(aTextStyle)
        self.c.drawRightString(
            ulx,
            uly + self.settings['textStyles'][aTextStyle][1]/2,
            atext)

    def drawLeftText(self, x, y, aTextStyle, atext):
        ulx = settings['page']['left']*mm + x*mm
        uly = self.height - (settings['page']['top']*mm + y*mm)
        
        self.setTextStyle(aTextStyle)
        self.c.drawString(
            ulx,
            uly + self.settings['textStyles'][aTextStyle][1]/2,
            atext
        )

    def drawBox(self, x, y, width, height, boxStyle):
        ulx = settings['page']['left']*mm + x*mm
        uly = self.height - (settings['page']['top']*mm + y*mm)
        self.setBoxStyle(boxStyle)
        self.c.rect(ulx, uly, width*mm, -height*mm)

    def drawLine(self, x, y, dx, dy, boxStyle):
        ulx = settings['page']['left']*mm + x*mm
        uly = self.height - (settings['page']['top']*mm + y*mm)
        self.c.setLineWidth(
            self.settings['boxStyles'][boxStyle][0])
        self.c.setStrokeColorRGB(
            *(self.settings['boxStyles'][boxStyle][1]))
        self.c.line(ulx, uly, ulx+dx*mm, uly+dy*mm)
    
    def clipBox(self, x, y, width, height):
        path = self.c.beginPath()
        path.rect(x, y, width, height)
        self.c.clipPath(path, stroke = 1, fill = 0)
    
    def drawLayerProfile(self, x, y, depth, color, pattern, width=15):
        """ """
        ulx = settings['page']['left']*mm + x*mm
        uly = self.height - (settings['page']['top']*mm + y*mm)

        # save current state of canvas
        self.c.saveState()

        # set clipping region
        self.clipBox(ulx, uly, width*mm, -depth*mm)
        self.c.setLineWidth(
            self.settings['boxStyles']['thin'][0]
        )
        
        if color:
            self.c.setFillColorRGB(color[0]/255, color[1]/255, color[2]/255)
            self.c.rect(ulx, uly, width*mm, -depth*mm,  fill=1)

        if pattern and path.isfile(pattern):
            # Opens the pattern
            bg = svg2rlg(pattern)

            # The width and height of the pattern
            bg_w = bg.width 
            bg_h = bg.height

            # The width and height of the layer
            w = width*mm
            h = depth*mm
            
            # Iterate through a grid, to place the background tile
            for i in range(0, int(w/bg_w)+1):
                for j in range(0, int(h/bg_h)+2):
                    renderPDF.draw(bg, self.c, ulx + (i*bg_w), uly - (j*bg_h))
            
        # restore original state
        self.c.restoreState()
    
    def drawStatigraphy(self, x, y, w, h, scale, dw):
        """ 
        x: top left box coordinate in mm
        y: top left box coordinate in mm
        w: box wiodth in mm 
        h: box height in mm
        scale: scale factor (denominator)
        dw: description width
        """

        self.c.setLineWidth(
            self.settings['boxStyles']['thin'][0]
        )
        
        if self.lastPlotElev is None:
            self.lastPlotElev = self.profile['elevation_z']
        
        low_m = self.lastPlotElev - (h * scale // 1000)
        top_m = self.lastPlotElev

        for l in self.profile['layers']:
            if l['conf_lithology'] and 'image' in l['conf_lithology']:
                pattern = self.settings['svgpath'] + l['conf_lithology']['image']

            else:
                pattern = None
                pattern = self.settings['svgpath'] +'15101001.svg'
            
            if l['conf_lithostra'] and 'color' in l['conf_lithostra']:
                color = l['conf_lithostra']['color']

            else:
                color = None
                color = random_color()

            # the layer is entirerly within the page
            if l['msm_to'] >= low_m and l['msm_from'] <= top_m:
                ly = y + ((top_m - l['msm_from']) * 1000 / scale)
                d = (l['msm_from'] - l['msm_to']) * 1000 / scale
                label_depth = l['msm_to']
            
            # the layer extend to the next the page    
            elif (
                l['msm_to'] < low_m and
                l['msm_from'] > low_m and
                l['msm_from'] <= top_m
            ):
                #ly = y + (l['depth_from'] * 1000 / scale)
                ly = y + ((top_m - l['msm_from']) * 1000 / scale)
                d = (l['msm_from'] - low_m) * 1000 / scale
                label_depth = low_m

            # the layer is a continuation of previous page and finish in the current
            elif (
                l['msm_to'] > low_m and
                l['msm_from'] > top_m and
                l['msm_to'] < top_m
            ):
                ly = y
                d = (top_m - l['msm_to']) * 1000 / scale
                label_depth = l['msm_to']

            # the layer is a continuation of previous page and extend in the following
            elif (
                l['msm_to'] < low_m and
                l['msm_from'] > top_m
            ):
                ly = y
                d = h
                label_depth = low_m

            else:
                ly = None
                d = None
                pass
            
            if ly:
                self.drawLayerProfile(
                    x,
                    ly, 
                    d,
                    color, 
                    pattern, 
                    w
                )

                self.drawLine(
                    x + w, ly + d, dw, 0, 'thin'
                )

                self.drawLeftText(
                    x + w + 1, ly + d - 1, 
                    'content', '{:+.2f} m'.format(label_depth) #l['msm_to'])
                )
                paratext = '<br/>'.join([
                    '<u>{}</u>: {}'.format(
                        _('lithology'),
                        l['lithology'] or '-'
                    ),
                    '<u>{}</u>: {}'.format(
                        _('lithostratigraphy'),
                        l['lithostratigraphy'] or '-'
                    ),
                    '<u>{}</u>: {}'.format(
                        _('notes'),
                        l['notes'] or '-'
                    )
                ])
                self.createParagraph(
                    paratext,
                    x + w, 
                    ly, 
                    'content', 
                    dw, 
                    d, 
                    align = TA_CENTER,
                    force = False
                )
        
        # external box 
        self.drawBox(x, y, w, h, 'thin')
        # set latest plotted elevation mslm
        self.lastPlotElev = low_m

    def createParagraph(self, ptext, x, y, style, width, height, align=TA_LEFT, force = False):
        """"""
        self.setParagraphStyle(style, align)
        p = Paragraph(ptext, style=self.pStyle)
        pw, ph = p.wrapOn(self.c, width*mm - 2*settings['page']['pad']*mm, height*mm)
        ulx = settings['page']['left']*mm + x*mm + settings['page']['pad']*mm
        uly = self.height - (settings['page']['top']*mm + y*mm + (height*mm)/2 + p.height/2)
        if force is False:
             if ph < height:
                p.drawOn(self.c, ulx, uly)
        else:
            p.drawOn(self.c, ulx, uly)

    def drawRuler(self, x, y, w, h, scale, rtype='elev'):
        """ 
        x: top left box coordinate in mm
        y: top left box coordinate in mm
        w: box width in mm 
        h: box height in mm
        scale: scale factor (denominator)
        rtype: 'elev' (m.a.s.l) or 'depth' (meter from surface)
        """

        # set major and minor tics in m
        minor_tics = None
        major_tics = None
        i = 0
        while minor_tics is None and i < 10:
            if 10**i <= self.profile['total_depth'] < 10**(i+1):
                minor_tics = 10**(i-2)
                major_tics = 10**(i-1)
            i = i + 1

        # external box 
        self.drawBox(x, y, w, h, 'thin')

        if self.lastPlotElev is not None:
            top_elev =  self.lastPlotElev
            top_dep = self.profile['elevation_z'] - self.lastPlotElev
        else:
            top_elev = self.profile['elevation_z']
            top_dep = 0

        # major tics
        for i in frange(
            10 - int(str(int(top_dep))[-1:]),
            min(
                self.profile['total_depth'],
                h * scale / 1000
            ),
            10
        ):
            self.drawLine(
                x + w - 2, y + (i * 1000 / scale), 2, 0, 'thin')
            
            if rtype == 'elev':
                self.drawRightText(
                    x + w - 3, y + 1 + (i * 1000 / scale), 
                    'content', '{:+.2f} m'.format(top_elev - i)
                )

            elif rtype == 'depth':
                self.drawRightText(
                    x + w - 3, y + 1 + (i * 1000 / scale), 
                    'content', '{:.0f} m'.format(top_dep + i)
                )

            else:
                raise ValueError("rtype can only be \'elev\' or \'depth\'")

        # minor tics
        for i in frange(
            minor_tics, 
            min(self.profile['total_depth'], h * scale / 1000), 
            minor_tics
        ):
            self.drawLine(
                x + w -1, y + (i * 1000 / scale) , 1, 0, 'thin'
            )
    
    def close(self):
        self.c.save()
      
    def renderProfilePDF(self, lang, scale=1000):
        
        lan = gettext.translation(
            'messages', 
            localedir= path.abspath(path.dirname(__file__))+'/locale', 
            languages=[lang]
        )

        _ = lan.gettext

        lan.install()

        page_width = 190
        page_height = 260

        #draw outer frame
        self.drawBox(0, 0, page_width, page_height, 'bold')
        
        #TITLE BOX
        self.drawTextBox(0, 0, 140, 15, 'bold', 
            'title', _('Geological_Profile'), 'center'
        )

        #vers. & date boxes
        self.drawLeftTextBox2(140, 0, 50, 12, 'bold',
            'contentB',  _('Scale'),
            'content', '1:{}'.format(scale)
        )

        self.drawLeftTextBox2(140, 12, 25, 3, 'bold',
            'contentB',  _('Vers'),
            'content', '{}'.format(self.profile['strataname'])
        )

        self.drawLeftTextBox2(165, 12, 25, 3, 'bold',
            'contentB',  _('Date'),
            'content', '{}'.format(self.profile['stratadate'])
        )

        start_y = 15
        current_y = start_y
        profile_y = current_y
        box_height = 5
        column_width = page_width / 3
        
        # POSITION BOX

        self.drawTextBox(
            0, current_y,
            column_width, box_height,
            'none',
            'subtitle', _('location'), 'center'
        )

        current_y += box_height

        self.drawLeftTextBox2(
            0, current_y,
            column_width, box_height,
            'none', 'contentB',  _('country'),
            'content', f"{self.profile['country']}"
        )

        current_y += box_height

        self.drawLeftTextBox2(
            0, current_y,
            column_width, box_height,
            'none', 'contentB',  _('canton'),
            'content', f"{self.profile['canton']}"
        )

        current_y += box_height

        self.drawLeftTextBox2(
            0, current_y,
            column_width, box_height,
            'none', 'contentB',  _('municipality'),
            'content', f"{self.profile['municipality']}"
        )

        current_y += box_height

        self.drawLeftTextBox2(
            0, current_y,
            column_width, box_height,
            'none', 'contentB',  _('coordinates'),
            'content', '{} E, {} N'.format(
                self.profile['location_e'],
                self.profile['location_n']
            )
        )

        current_y += box_height

        self.drawLeftTextBox2(
            0, current_y,
            column_width, box_height,
            'none', 'contentB',  _('elevation'),
            'content', '{} {}'.format(
                self.profile['elevation_z'],
                _('m.a.s.l')
            )
        )

        current_y += box_height

        self.drawLeftTextBox2(
            0, current_y,
            column_width, box_height,
            'none', 'contentB',  _('reference systems'),
            'content', '{}, {}'.format(
                self.profile['spatial_reference_system'],
                self.profile['height_reference_system']
            )
        )

        profile_y = max(profile_y, current_y)
        
        current_y = start_y

        # PROJECT BOX

        self.drawTextBox(
            column_width, current_y,
            column_width, box_height,
            'none', 'subtitle', _('project'), 'center'
        )

        current_y += box_height

        self.drawLeftTextBox2(
            column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('project_name'),
            'content', '{}'.format(self.profile['project_name'] or '-')
        )

        if self.profile['identifiers'] is not None:
            for identifier in self.profile['identifiers']:
                current_y += box_height
                self.drawLeftTextBox2(
                    column_width, current_y,
                    column_width, box_height,
                    'none', 'contentB',  identifier['identifier'],
                    'content', '{}'.format(identifier['value'] or '-')
                )

        current_y += box_height

        self.drawLeftTextBox2(
            column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('purpose'),
            'content', '{}'.format(self.profile['purpose'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('status'),
            'content', '{}'.format(self.profile['status'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('drilling_date'),
            'content', '{}'.format(self.profile['drilling_date'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('restriction'),
            'content', '{} {}'.format(
                self.profile['restriction'] or '-',
                self.profile['restrictoin_until'] or '')
        )

        current_y += box_height

        profile_y = max(profile_y, current_y)

        current_y = start_y

        # BOREHOLE BOX

        self.drawTextBox(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'subtitle', _('borehole'), 'center'
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('kind'),
            'content', '{}'.format(self.profile['kind'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('drill_diameter'),
            'content', '{} m'.format(self.profile['drill_diameter'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('total_depth'),
            'content', '{} m'.format(self.profile['total_depth'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('groundwater'),
            'content', '{}'.format(self.profile['groundwater'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('cuttings'),
            'content', '{}'.format(self.profile['cuttings'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('method'),
            'content', '{}'.format(self.profile['method'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('inclination'),
            'content', '{} deg'.format(self.profile['inclination'] or '-')
        )

        current_y += box_height

        self.drawLeftTextBox2(
            2*column_width, current_y,
            column_width, box_height,
            'none', 'contentB',  _('inclination_direction'),
            'content', '{} deg'.format(self.profile['inclination_direction'] or '-')
        )


        profile_y = max(profile_y, current_y)

        # Drawing bold boxes
        self.drawBox(
            0, start_y,
            column_width, profile_y - 2 * box_height,
            'bold'
        )
        self.drawBox(
            column_width, start_y,
            column_width, profile_y - 2 * box_height,
            'bold'
        )
        self.drawBox(
            column_width, start_y,
            column_width, profile_y - 2 * box_height,
            'bold'
        )

        profile_y += box_height

        self.drawProfile(
            0, profile_y, page_width, page_height - profile_y, scale
        )

        pages = int(
            (
                (self.profile['total_depth'] * 1000 / scale) + 70 
            ) / page_height
        ) + 1
        i = 1

        # Add page number
        self.drawRightText(
            page_width, 265,
            'content', 'p. {}/{}'.format(i, pages)
        )
        self.c.showPage()

        while self.lastPlotElev > (
            self.profile['elevation_z'] - self.profile['total_depth']
        ):
            self.drawProfile(
                0, 0, page_width, page_height, scale
            )
            i = i + 1

            # Add page number
            self.drawRightText(
                page_width, 265,
                'content',
                'p. {}/{}'.format(i,pages)
            )
            self.c.showPage()

    def drawProfile(self, x, y, w, h, scale):

        # PROFILE PLOT
        # ==============
        self.drawBox(x, y, w, h, 'bold')

        # elevation header
        self.drawTextBox(x, y, 20, 10, 'bold',
            'subtitle', _('elevation'), 'center'
        )
        # ruler elevation
        self.drawRuler(x, y+10, 20, h-10, scale, 'elev')

        # depth header
        self.drawTextBox(x+20, y, 20, 10, 'bold',
            'subtitle', _('depth'), 'center'
        )
        # ruler depth
        self.drawRuler(x+20, y+10, 20, h-10, scale, 'depth')

        # description header
        self.drawTextBox(x+70, y, w-70, 10, 'bold',
            'subtitle', _('material description'), 'center'
        )

        # stratigraphy & description
        self.drawStatigraphy(x+40, y+10, 30, h-10, scale, w-70)

        # stratigraphy header
        self.drawTextBox(x+40, y, 30, 10, 'bold',
            'subtitle', _('stratigraphy'), 'center'
        )
