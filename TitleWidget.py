from PyQt5.QtCore import Qt, pyqtSignal, QPoint
from PyQt5.QtGui import QFont
from PyQt5.QtWidgets import QHBoxLayout, QLabel, QSpacerItem, QSizePolicy
from PyQt5.QtWidgets import QWidget,QPushButton
class TitleBar(QWidget):
    # 窗口信号
    windowMinimumed = pyqtSignal()
    windowMaximumed = pyqtSignal()
    windowNormaled = pyqtSignal()
    windowClosed = pyqtSignal()
    windowMoved = pyqtSignal(QPoint)

    def __init__(self, *args, **kwargs):
        super(TitleBar, self).__init__(*args, **kwargs)
        # 支持qss设置背景
        self.setAttribute(Qt.WA_StyledBackground, True)
        self.mPos = None
        self.iconSize = 30  # 图标的默认大小
        # 设置默认背景颜色,否则由于受到父窗口的影响导致透明
        self.setAutoFillBackground(True)
        # palette = self.palette()
        # palette.setColor(palette.Window, QColor(240, 240, 240))
        # self.setPalette(palette)
        # 布局
        layout = QHBoxLayout(self, spacing=0)
        layout.setContentsMargins(0, 0, 0, 0)
        # 利用Webdings字体来显示图
        font = self.font() or QFont()
        font.setFamily('Webdings')
        # 左侧图标
        self.buttonHome = QPushButton('H',self,font=font,objectName='buttonHome')
        layout.addWidget(self.buttonHome)
        # 弹簧
        layout.addSpacerItem(QSpacerItem(40, 20, QSizePolicy.Expanding, QSizePolicy.Minimum))
        # 窗口图标和标题
        self.iconLabel = QLabel(self)
        layout.addWidget(self.iconLabel)
        self.titleLabel = QLabel(self)
        self.titleLabel.setObjectName('titleLabel')
        self.titleLabel.setMargin(2)
        layout.addWidget(self.titleLabel)
        # 弹簧
        layout.addSpacerItem(QSpacerItem(40, 20, QSizePolicy.Expanding, QSizePolicy.Minimum))
        # 最小化按钮
        self.buttonMinimum = QPushButton(
            '6', self, clicked=self.windowMinimumed.emit, font=font, objectName='buttonMinimum')
        layout.addWidget(self.buttonMinimum)
        # 最大化/还原按钮
        self.buttonMaximum = QPushButton(
            '1', self, clicked=self.showMaximized, font=font, objectName='buttonMaximum')
        layout.addWidget(self.buttonMaximum)
        # 关闭按钮
        self.buttonClose = QPushButton(
            'r', self, clicked=self.windowClosed.emit, font=font, objectName='buttonClose')
        layout.addWidget(self.buttonClose)
        layout.setContentsMargins(20,0,0,0)
        # 初始高度
        self.setHeight()


    def showMaximized(self):
        if self.buttonMaximum.text() == '1':
            # 最大化
            self.buttonMaximum.setText('2')
            self.windowMaximumed.emit()
        else:  # 还原
            self.buttonMaximum.setText('1')
            self.windowNormaled.emit()

    def setHeight(self, height=38):
        #设置标题栏高度
        self.setMinimumHeight(height)
        self.setMaximumHeight(height)
        self.buttonMinimum.setMinimumSize(height, height)
        self.buttonMinimum.setMaximumSize(height, height)
        self.buttonMaximum.setMinimumSize(height, height)
        self.buttonMaximum.setMaximumSize(height, height)
        self.buttonClose.setMinimumSize(height, height)
        self.buttonClose.setMaximumSize(height, height)

    def setTitle(self, title):
        #设置标题
        self.titleLabel.setText(title)

    def setIcon(self, icon):
        #设置图标
        self.iconLabel.setPixmap(icon.pixmap(self.iconSize, self.iconSize))

    def setIconSize(self, size):
        #设置图标大小S
        self.iconSize = size

    def enterEvent(self, event):
        self.setCursor(Qt.ArrowCursor)
        super(TitleBar, self).enterEvent(event)

    def mouseDoubleClickEvent(self, event):
        #双击最大化
        super(TitleBar, self).mouseDoubleClickEvent(event)
        self.showMaximized()

    def mousePressEvent(self, event):
        #鼠标按下
        if event.button() == Qt.LeftButton:
            self.mPos = event.pos()
        event.accept()

    def mouseReleaseEvent(self, event):
        #鼠标松开
        self.mPos = None
        event.accept()

    def mouseMoveEvent(self, event):
        #鼠标移动
        if event.buttons() == Qt.LeftButton and self.mPos:
            self.windowMoved.emit(self.mapToGlobal(event.pos() - self.mPos))
        event.accept()
