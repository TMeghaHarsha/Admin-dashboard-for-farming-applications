from __future__ import annotations

import csv
import io
import secrets
from datetime import date, datetime, timedelta

razorpay = None  # type: ignore
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, F
from django.http import HttpResponse
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.models_app.token import UserAuthToken
from apps.models_app.user import CustomUser, Role, UserRole

from .auth import TokenAuthentication
from .permissions import IsOwnerOrReadOnly, HasRole
from .serializers import (
    AssetSerializer,
    ActivitySerializer,
    RoleSerializer,
    CropSerializer,
    CropVarietySerializer,
    DeviceSerializer,
    FarmSerializer,
    FeatureSerializer,
    FeatureTypeSerializer,
    FieldIrrigationMethodSerializer,
    FieldIrrigationPracticeSerializer,
    FieldSerializer,
    CropLifecycleDatesSerializer,
    LoginSerializer,
    NotificationSerializer,
    SignUpSerializer,
    SoilReportSerializer,
    SoilTextureSerializer,
    SupportRequestSerializer,
    TokenSerializer,
    PlanSerializer,
    UserPlanSerializer,
    IrrigationMethodSerializer,
    PaymentMethodSerializer,
    TransactionSerializer,
)

from apps.models_app.assets import Asset
from apps.models_app.crop_variety import Crop, CropVariety
from apps.models_app.farm import Farm
from apps.models_app.field import Field, Device, CropLifecycleDates, FieldIrrigationMethod, FieldIrrigationPractice
from apps.models_app.feature import Feature, FeatureType
from apps.models_app.plan import Plan
from apps.models_app.user_plan import UserPlan, PaymentMethod, Transaction
from apps.models_app.notifications import Notification, SupportRequest
from apps.models_app.irrigation import IrrigationMethods
from apps.models_app.models import UserActivity
from apps.models_app.soil_report import SoilReport, SoilTexture


class SignUpView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Ensure default role assignment for end users
        try:
            end_role, _ = Role.objects.get_or_create(name="End-App-User")
            UserRole.objects.get_or_create(user=user, role=end_role, defaults={"userrole_id": user.email or user.username})
        except Exception:
            pass
        token_value = secrets.token_urlsafe(48)
        UserAuthToken.objects.update_or_create(user=user, defaults={"access_token": token_value})
        return Response({"user": UserSerializer(user).data, "token": token_value}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, username=serializer.validated_data["username"], password=serializer.validated_data["password"])
        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        # Ensure role exists on first login if missing
        try:
            end_role, _ = Role.objects.get_or_create(name="End-App-User")
            UserRole.objects.get_or_create(user=user, role=end_role, defaults={"userrole_id": user.email or user.username})
        except Exception:
            pass
        token_value = secrets.token_urlsafe(48)
        UserAuthToken.objects.update_or_create(user=user, defaults={"access_token": token_value})
        return Response({"token": token_value})


class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({"detail": "Logged out"})


class MeView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        user = request.user
        allowed_fields = {"email", "username", "full_name", "phone_number", "avatar"}
        for key, value in request.data.items():
            if key in allowed_fields:
                setattr(user, key, value)
        user.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        if not current_password or not new_password:
            return Response({"detail": "current_password and new_password are required"}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        from django.contrib.auth import password_validation

        password_validation.validate_password(new_password, user)
        user.set_password(new_password)
        user.save(update_fields=["password"])
        # Record activity in recent activity log
        try:
            ct = ContentType.objects.get_for_model(user.__class__)
            UserActivity.objects.create(
                user=user,
                action="update",
                content_type=ct,
                object_id=user.pk,
                description="Password changed",
            )
        except Exception:
            pass
        return Response({"detail": "Password changed successfully"})


class SuggestPasswordView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request):
        pw = secrets.token_urlsafe(12)
        return Response({"password": pw})


class ResetPasswordView(APIView):
    """Allow resetting password without current password.

    If authenticated, reset for the current user.
    If unauthenticated, requires a valid username to identify the account.
    """
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        username = request.data.get("username")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        if not new_password or not confirm_password:
            return Response({"detail": "new_password and confirm_password are required"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"detail": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve user: prefer authenticated token if present; else username
        user: CustomUser | None = None
        try:
            auth_header = request.headers.get("Authorization") or ""
            if auth_header.startswith("Token "):
                token_value = auth_header.split(" ", 1)[1]
                token_obj = UserAuthToken.objects.filter(access_token=token_value).select_related("user").first()
                if token_obj:
                    user = token_obj.user
        except Exception:
            user = None
        if user is None and username:
            user = CustomUser.objects.filter(username=username).first()
        if user is None:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        from django.contrib.auth import password_validation
        password_validation.validate_password(new_password, user)
        user.set_password(new_password)
        user.save(update_fields=["password"])
        # Record activity
        try:
            ct = ContentType.objects.get_for_model(user.__class__)
            UserActivity.objects.create(user=user, action="update", content_type=ct, object_id=user.pk, description="Password reset")
        except Exception:
            pass
        return Response({"detail": "Password reset successfully"})


class DashboardView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        from django.utils import timezone

        user = request.user
        user_fields = Field.objects.filter(user=user, is_active=True)
        active_fields = user_fields.count()

        # Count fields with a crop assigned (considered active until harvested)
        # Prefer explicit lifecycle harvested flag when available, otherwise count assigned crops
        lifecycle_active = (
            CropLifecycleDates.objects
            .filter(field__in=user_fields, field__crop__isnull=False, harvesting_date__isnull=True)
            .values("field_id")
            .distinct()
            .count()
        )
        assigned_crops = user_fields.filter(crop__isnull=False).count()
        active_crops = max(lifecycle_active, assigned_crops)

        # Total area in hectares summed from JSON field
        total_hectares = 0.0
        for f in user_fields:
            try:
                hectares = (f.area or {}).get("hectares")
                if isinstance(hectares, (int, float)):
                    total_hectares += float(hectares)
            except Exception:
                pass

        plans = UserPlan.objects.filter(user=user, is_active=True).select_related("plan")
        current_plan = plans.first()
        notifications_count = Notification.objects.filter(receiver=user, is_read=False).count()
        recent_practices_qs = (
            FieldIrrigationPractice.objects
            .filter(field__user=user)
            .select_related("field", "irrigation_method")
            .order_by("-performed_at")[:3]
        )
        recent_practices = FieldIrrigationPracticeSerializer(recent_practices_qs, many=True).data
        recent_activity = UserActivity.objects.filter(user=user).order_by("-created_at")[:5]
        return Response(
            {
                "active_fields": active_fields,
                "active_crops": active_crops,
                "current_plan": UserPlanSerializer(current_plan).data if current_plan else None,
                "total_hectares": round(total_hectares, 4),
                "unread_notifications": notifications_count,
                "current_practices": recent_practices,
                "recent_activity": ActivitySerializer(recent_activity, many=True).data,
            }
        )


class MenuView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        # Basic role/plan gate example
        base_items = [
            {"key": "dashboard", "label": "Dashboard"},
            {"key": "crops", "label": "Crops"},
            {"key": "fields", "label": "Fields"},
            {"key": "subscriptions", "label": "Subscriptions"},
            {"key": "reports", "label": "Reports"},
            {"key": "settings", "label": "Settings"},
        ]
        return Response(base_items)


class AdminUsersViewSet(viewsets.ModelViewSet):
    """Admin: manage users and assign roles."""

    authentication_classes = [TokenAuthentication]
    permission_classes = [HasRole]
    required_roles = ["SuperAdmin", "Admin", "Analyst", "Business", "Development"]

    def get_queryset(self):
        return CustomUser.objects.all().order_by("-date_joined")

    def get_serializer_class(self):  # defer import to avoid circular timing
        from .serializers import UserSerializer as _UserSerializer

        return _UserSerializer

    @action(detail=True, methods=["post"], url_path="assign-role")
    def assign_role(self, request, pk=None):
        user = self.get_object()
        role_name = request.data.get("role")
        if not role_name:
            return Response({"detail": "role is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Determine acting user's roles
        try:
            actor_roles = set(
                request.user.user_roles.select_related("role").values_list("role__name", flat=True)
            )
        except Exception:
            actor_roles = set()

        # SuperAdmin (or Django superuser) can assign any role
        is_super_admin = request.user.is_superuser or ("SuperAdmin" in actor_roles)
        if not is_super_admin:
            # Admins can assign non-end-user, non-admin, non-superadmin roles only
            if "Admin" in actor_roles:
                disallowed = {"SuperAdmin", "Admin", "End-App-User"}
                if role_name in disallowed:
                    return Response({"detail": "Admins cannot assign this role"}, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({"detail": "Only SuperAdmin or Admin can assign roles"}, status=status.HTTP_403_FORBIDDEN)

        role, _ = Role.objects.get_or_create(name=role_name)
        UserRole.objects.get_or_create(
            user=user, role=role, defaults={"userrole_id": user.email or user.username}
        )
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class AdminRolesViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [HasRole]
    required_roles = ["SuperAdmin", "Admin", "Business", "Development"]
    queryset = Role.objects.all().order_by("name")
    serializer_class = RoleSerializer


class AdminNotificationsViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [HasRole]
    required_roles = ["SuperAdmin", "Admin", "Support", "Business", "Development"]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return (
            Notification.objects.all()
            .select_related("receiver", "sender")
            .order_by("-created_at")
        )

    def create(self, request, *args, **kwargs):
        message = request.data.get("message", "").strip()
        if not message:
            return Response({"detail": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Accept either a single receiver or a list of target_roles for bulk send
        target_roles = request.data.get("target_roles") or []
        if isinstance(target_roles, str):
            try:
                # support comma separated values
                target_roles = [r.strip() for r in target_roles.split(",") if r.strip()]
            except Exception:
                target_roles = []

        if target_roles:
            try:
                users_qs = CustomUser.objects.filter(
                    user_roles__role__name__in=target_roles
                ).distinct()
                created = 0
                for u in users_qs:
                    Notification.objects.create(sender=request.user, receiver=u, message=message)
                    created += 1
                return Response({"sent": created}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Fallback to a single receiver or self
        receiver_id = request.data.get("receiver")
        receiver = None
        if receiver_id:
            receiver = CustomUser.objects.filter(pk=receiver_id).first()
        obj = Notification.objects.create(
            sender=request.user,
            receiver=receiver or request.user,
            message=message,
        )
        serializer = self.get_serializer(obj)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AdminFieldViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [HasRole]
    required_roles = ["SuperAdmin", "Admin", "Analyst", "Agronomist", "Business", "Development"]
    queryset = Field.objects.select_related("user", "farm", "crop", "crop_variety", "soil_type")
    serializer_class = FieldSerializer


class AdminAnalyticsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [HasRole]
    required_roles = ["SuperAdmin", "Admin", "Analyst", "Business", "Development"]

    def get(self, request):
        total_users = CustomUser.objects.count()
        total_fields = Field.objects.count()
        total_plans = Plan.objects.count()
        active_subscriptions = UserPlan.objects.filter(is_active=True).count()
        return Response(
            {
                "total_users": total_users,
                "total_fields": total_fields,
                "total_plans": total_plans,
                "active_subscriptions": active_subscriptions,
            }
        )


class EnsureRoleView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        role_name = request.data.get("role")
        if not role_name:
            return Response({"detail": "role is required"}, status=status.HTTP_400_BAD_REQUEST)
        # Only allow all users to ensure the default end-user role for themselves.
        # Elevating to privileged roles requires SuperAdmin (or Django superuser).
        try:
            user_roles = set(
                request.user.user_roles.select_related("role").values_list("role__name", flat=True)
            )
        except Exception:
            user_roles = set()
        if role_name != "End-App-User":
            is_super_admin = request.user.is_superuser or ("SuperAdmin" in user_roles)
            if not is_super_admin:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        role, _ = Role.objects.get_or_create(name=role_name)
        UserRole.objects.get_or_create(
            user=request.user, role=role, defaults={"userrole_id": request.user.email or request.user.username}
        )
        roles = list(
            request.user.user_roles.select_related("role").values_list("role__name", flat=True)
        )
        return Response({"roles": roles})


class CropViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = Crop.objects.all()
    serializer_class = CropSerializer
    filterset_fields = ["name"]
    search_fields = ["name"]
    ordering_fields = ["name"]


class CropVarietyViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = CropVariety.objects.select_related("crop").all()
    serializer_class = CropVarietySerializer
    filterset_fields = ["crop", "name", "is_primary"]
    search_fields = ["name", "crop__name"]
    ordering_fields = ["name"]


class FarmViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = FarmSerializer
    filterset_fields = ["name"]
    search_fields = ["name"]
    ordering_fields = ["name"]

    def get_queryset(self):
        return Farm.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FieldViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = FieldSerializer
    filterset_fields = ["farm", "crop", "is_active"]
    search_fields = ["name", "location_name"]
    ordering_fields = ["created_at", "updated_at", "name"]

    def get_queryset(self):
        return Field.objects.filter(user=self.request.user).select_related("farm", "crop", "crop_variety")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get"])
    def lifecycle(self, request, pk=None):
        field = self.get_object()
        data = CropLifecycleDates.objects.filter(field=field).values(
            "sowing_date",
            "growth_start_date",
            "flowering_date",
            "harvesting_date",
            "yield_amount",
        ).first()
        return Response(data or {})

    @action(detail=True, methods=["post"])
    def update_lifecycle(self, request, pk=None):
        field = self.get_object()
        payload = {
            "sowing_date": request.data.get("sowing_date"),
            "growth_start_date": request.data.get("growth_start_date"),
            "flowering_date": request.data.get("flowering_date"),
            "harvesting_date": request.data.get("harvesting_date"),
            "yield_amount": request.data.get("yield_amount"),
        }
        obj, _ = CropLifecycleDates.objects.update_or_create(field=field, defaults=payload)
        return Response(CropLifecycleDatesSerializer(obj).data)

    def partial_update(self, request, *args, **kwargs):
        # Allow updating Field normally, and handle irrigation_method specially
        response = None
        method_id = request.data.get("irrigation_method")
        if method_id:
            try:
                field = self.get_object()
                method = IrrigationMethods.objects.get(pk=method_id)
                FieldIrrigationMethod.objects.update_or_create(field=field, defaults={"irrigation_method": method})
            except IrrigationMethods.DoesNotExist:
                return Response({"detail": "Invalid irrigation_method"}, status=status.HTTP_400_BAD_REQUEST)
        # Proceed with default partial update for other fields
        response = super().partial_update(request, *args, **kwargs)
        # Return fresh serialized field with derived attributes
        field = self.get_object()
        return Response(FieldSerializer(field).data)

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj_id = obj.pk
        resp = super().destroy(request, *args, **kwargs)
        # Record activity
        try:
            ct = ContentType.objects.get_for_model(obj.__class__)
            UserActivity.objects.create(
                user=request.user,
                action="delete",
                content_type=ct,
                object_id=obj_id,
                description=f"Field delete",
            )
        except Exception:
            pass
        return resp

    @action(detail=True, methods=["post"], url_path="set_irrigation_method")
    def set_irrigation_method(self, request, pk=None):
        field = self.get_object()
        method_id = request.data.get("irrigation_method")
        if not method_id:
            return Response({"detail": "irrigation_method is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            method = IrrigationMethods.objects.get(pk=method_id)
        except IrrigationMethods.DoesNotExist:
            return Response({"detail": "Invalid irrigation_method"}, status=status.HTTP_400_BAD_REQUEST)
        FieldIrrigationMethod.objects.update_or_create(field=field, defaults={"irrigation_method": method})
        return Response({"detail": "Irrigation method set"})


class SoilReportViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = SoilReport.objects.select_related("field", "soil_type").all()
    serializer_class = SoilReportSerializer
    filterset_fields = ["field", "soil_type"]

    def perform_create(self, serializer):
        report = serializer.save()
        # Set a convenient report link to the PDF export filtered by field
        try:
            report.report_link = f"/api/reports/export/pdf/?field_id={report.field_id}"
            report.save(update_fields=["report_link"])
        except Exception:
            pass


class SoilTextureViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = SoilTexture.objects.all()
    serializer_class = SoilTextureSerializer


class IrrigationMethodViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = IrrigationMethods.objects.all()
    serializer_class = IrrigationMethodSerializer
    search_fields = ["name"]


class FieldIrrigationPracticeViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = FieldIrrigationPracticeSerializer

    def get_queryset(self):
        return FieldIrrigationPractice.objects.filter(field__user=self.request.user).select_related("field", "irrigation_method")


class AssetViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(receiver=self.request.user)

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        cnt = self.get_queryset().filter(is_read=False).count()
        return Response({"count": cnt})

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"detail": "Marked as read"})


class SupportRequestViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = SupportRequestSerializer

    def get_queryset(self):
        return SupportRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        obj = serializer.save(user=self.request.user)
        # Auto route to appropriate roles and create notifications (Support flows)
        try:
            category = obj.category
            # Map categories to roles that should be notified
            category_roles_map = {
                "transaction": ["Business", "Support", "Admin"],
                "analysis": ["Analyst", "Support", "Admin"],
                "software_issue": ["Development", "Support", "Admin"],
                "crop": ["Agronomist", "Support", "Admin"],
            }
            target_roles = category_roles_map.get(category, ["Support", "Admin"])
            # Ensure we do not include SuperAdmin per requirements
            target_roles = [r for r in target_roles if r != "SuperAdmin"]
            # Persist the first assigned role for quick triage
            try:
                obj.assigned_role = target_roles[0]
                obj.save(update_fields=["assigned_role"])
            except Exception:
                pass
            users = CustomUser.objects.filter(user_roles__role__name__in=target_roles).distinct()
            for u in users:
                Notification.objects.create(
                    sender=self.request.user,
                    receiver=u,
                    message=f"Support request ({category}) from {self.request.user.username}: {obj.description[:140]}"
                )
        except Exception:
            # Non-critical
            pass


class PracticeViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    authentication_classes = [TokenAuthentication]
    # Placeholder for practices list
    def list(self, request, *args, **kwargs):
        # Could be tied to crop lifecycle tracking
        return Response([])


class FeatureViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = Feature.objects.select_related("feature_type").all()
    serializer_class = FeatureSerializer


class FeatureTypeViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = FeatureType.objects.all()
    serializer_class = FeatureTypeSerializer


class PlanViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer


class UserPlanViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    queryset = UserPlan.objects.select_related("user", "plan").all()
    serializer_class = UserPlanSerializer

    def get_queryset(self):
        return UserPlan.objects.filter(user=self.request.user).select_related("plan")

    def perform_create(self, serializer):
        user_plan = serializer.save(user=self.request.user)
        try:
            # Record a simple transaction entry for the selected plan
            Transaction.objects.create(
                user=self.request.user,
                plan=user_plan.plan,
                amount=user_plan.plan.price,
                currency="USD",
                status="paid",
            )
        except Exception:
            pass
        # Record activity
        try:
            ct = ContentType.objects.get_for_model(user_plan.__class__)
            UserActivity.objects.create(
                user=self.request.user,
                action="create",
                content_type=ct,
                object_id=user_plan.pk,
                description=f"Selected plan {getattr(user_plan.plan, 'name', '-')}",
            )
        except Exception:
            pass
        # Auto notify user (Business flow) about subscription
        try:
            Notification.objects.create(
                sender=None,
                receiver=self.request.user,
                message=f"Your subscription to {getattr(user_plan.plan, 'name', '-')} is active."
            )
        except Exception:
            pass


class PaymentMethodViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = PaymentMethodSerializer

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [TokenAuthentication]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related("plan")

    @action(detail=True, methods=["get"], url_path="invoice")
    def invoice(self, request, pk=None):
        # Generate a simple invoice PDF on the fly
        try:
            from reportlab.pdfgen import canvas
        except Exception:
            return Response({"detail": "reportlab not installed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        txn = self.get_object()
        import io
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.setTitle("Invoice")
        y = 800
        p.drawString(100, y, "Invoice")
        y -= 20
        p.drawString(100, y, f"Transaction ID: {txn.id}")
        y -= 20
        p.drawString(100, y, f"User: {txn.user.username}")
        y -= 20
        p.drawString(100, y, f"Plan: {getattr(txn.plan, 'name', '-')}")
        y -= 20
        p.drawString(100, y, f"Amount: {txn.amount} {txn.currency}")
        y -= 20
        p.drawString(100, y, f"Status: {txn.status}")
        y -= 40
        p.drawString(100, y, "Thank you for your purchase.")
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = f"attachment; filename=invoice_{txn.id}.pdf"
        return response


class RazorpayCreateOrderView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        amount = int(float(request.data.get("amount", 0)) * 100)
        currency = request.data.get("currency", "INR")
        # Lazy import to avoid hard dependency during CI checks
        global razorpay  # type: ignore
        if razorpay is None:
            from importlib import import_module

            razorpay = import_module("razorpay")  # type: ignore
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))  # type: ignore
        order = client.order.create({"amount": amount, "currency": currency})
        return Response(order)


class RazorpayWebhookView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        # TODO: verify signature, update transactions, handle refunds/status
        return Response({"status": "ok"})


class ExportCSVView(APIView):
    # Accept token via header or query param; handle auth manually to support new-tab downloads
    authentication_classes: list = []

    def get(self, request):
        # Resolve user from Authorization header (Token ...) or token query param
        resolved_user: CustomUser | None = None
        try:
            auth_header = request.headers.get("Authorization") or ""
            token_value = None
            if auth_header.startswith("Token "):
                token_value = auth_header.split(" ", 1)[1]
            token_value = token_value or request.query_params.get("token") or request.query_params.get("access_token")
            if token_value:
                tok = UserAuthToken.objects.filter(access_token=token_value).select_related("user").first()
                if tok:
                    resolved_user = tok.user
        except Exception:
            resolved_user = None
        if resolved_user is None:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        # Optional date filters (YYYY-MM-DD)
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        field_id = request.query_params.get("field_id") or request.query_params.get("field")
        start_date = None
        end_date = None
        try:
            if start_date_str:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            if end_date_str:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except Exception:
            pass

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["Field", "Crop", "Hectares"])
        queryset = Field.objects.filter(user=resolved_user)
        if field_id:
            queryset = queryset.filter(pk=field_id)
        if start_date:
            queryset = queryset.filter(updated_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(updated_at__date__lte=end_date)
        for fld in queryset:
            hectares = (fld.area or {}).get("hectares")
            writer.writerow([fld.name, getattr(fld.crop, "name", "-"), hectares])
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=report.csv"
        return response


class ExportPDFView(APIView):
    # Accept token via header or query param; handle auth manually to support new-tab downloads
    authentication_classes: list = []

    def get(self, request):
        # Resolve user from Authorization header (Token ...) or token query param
        resolved_user: CustomUser | None = None
        try:
            auth_header = request.headers.get("Authorization") or ""
            token_value = None
            if auth_header.startswith("Token "):
                token_value = auth_header.split(" ", 1)[1]
            token_value = token_value or request.query_params.get("token") or request.query_params.get("access_token")
            if token_value:
                tok = UserAuthToken.objects.filter(access_token=token_value).select_related("user").first()
                if tok:
                    resolved_user = tok.user
        except Exception:
            resolved_user = None
        if resolved_user is None:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        # Minimal PDF export with optional date filter
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")
        field_id = request.query_params.get("field_id") or request.query_params.get("field")
        start_date = None
        end_date = None
        try:
            if start_date_str:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            if end_date_str:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except Exception:
            pass
        from reportlab.pdfgen import canvas

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 800, "OELP Report")
        y = 760
        queryset = Field.objects.filter(user=resolved_user)
        if field_id:
            queryset = queryset.filter(pk=field_id)
        if start_date:
            queryset = queryset.filter(updated_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(updated_at__date__lte=end_date)
        for fld in queryset[:30]:
            p.drawString(100, y, f"Field: {fld.name}")
            y -= 20
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = "attachment; filename=report.pdf"
        return response

class AnalyticsSummaryView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        user = request.user

        # Crop distribution by assigned crop on fields
        crop_counts = (
            Field.objects.filter(user=user)
            .values("crop__name")
            .annotate(cnt=Count("id"))
            .order_by("-cnt")
        )
        crop_distribution = [
            {"name": (row["crop__name"] or "Unassigned"), "value": row["cnt"]}
            for row in crop_counts
        ]

        # Irrigation distribution: prefer explicit method mapping; fallback to practices
        irrigation_counts = (
            FieldIrrigationMethod.objects.filter(field__user=user)
            .values("irrigation_method__name")
            .annotate(cnt=Count("id"))
            .order_by("-cnt")
        )
        irrigation_distribution = [
            {"name": (row["irrigation_method__name"] or "Unspecified"), "value": row["cnt"]}
            for row in irrigation_counts
        ]
        if not irrigation_distribution:
            practice_counts = (
                FieldIrrigationPractice.objects.filter(field__user=user)
                .values("irrigation_method__name")
                .annotate(cnt=Count("id"))
                .order_by("-cnt")
            )
            irrigation_distribution = [
                {"name": (row["irrigation_method__name"] or "Unspecified"), "value": row["cnt"]}
                for row in practice_counts
            ]

        # Lifecycle completion percentage
        total_lifecycle = CropLifecycleDates.objects.filter(field__user=user).count()
        completed_lifecycle = (
            CropLifecycleDates.objects.filter(field__user=user, harvesting_date__isnull=False).count()
        )
        lifecycle_completion = int(round((completed_lifecycle / total_lifecycle) * 100)) if total_lifecycle else 0

        has_data = bool(crop_distribution or irrigation_distribution or total_lifecycle)

        return Response(
            {
                "has_data": has_data,
                "lifecycle_completion": lifecycle_completion,
                "crop_distribution": crop_distribution,
                "irrigation_distribution": irrigation_distribution,
            }
        )

# Import at end to avoid circular reference
from .serializers import UserSerializer  # noqa: E402

