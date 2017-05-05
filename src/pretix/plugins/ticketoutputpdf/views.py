from django.views.generic import TemplateView

from pretix.control.permissions import EventPermissionRequiredMixin
from pretix.control.views import ChartContainingView


class EditorView(EventPermissionRequiredMixin, ChartContainingView, TemplateView):
    template_name = 'pretixplugins/ticketoutputpdf/index.html'
    permission = 'can_change_settings'
