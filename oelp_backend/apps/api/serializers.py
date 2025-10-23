from __future__ import annotations

from django.contrib.auth import password_validation
from rest_framework import serializers

from apps.models_app.assets import Asset
from apps.models_app.crop_variety import Crop, CropVariety
from apps.models_app.farm import Farm
from apps.models_app.field import Field, Device, CropLifecycleDates, FieldIrrigationMethod, FieldIrrigationPractice
from apps.models_app.feature import Feature, FeatureType
from apps.models_app.feature_plan import PlanFeature
from apps.models_app.irrigation import IrrigationMethods
from apps.models_app.notifications import Notification, SupportRequest
from apps.models_app.plan import Plan
from apps.models_app.soil_report import SoilTexture, SoilReport
from apps.models_app.token import UserAuthToken
from apps.models_app.user import CustomUser, Role, UserRole
from apps.models_app.models import UserActivity
from apps.models_app.user_plan import (
    UserPlan,
    PlanFeatureUsage,
    PaymentMethod,
    Transaction,
)


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            "id",
            "email",
            "username",
            "full_name",
            "phone_number",
            "avatar",
            "date_joined",
            "roles",
        )

    def get_roles(self, obj):
        try:
            return list(obj.user_roles.select_related("role").values_list("role__name", flat=True))
        except Exception:
            return []


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ("id", "name", "description")


class UserRoleSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = UserRole
        fields = ("id", "user", "user_username", "role", "role_name", "userrole_id", "assigned_at")


class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # Enforce required user fields per product requirements
    username = serializers.CharField(required=True, allow_blank=False)
    full_name = serializers.CharField(required=True, allow_blank=False)
    phone_number = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = CustomUser
        fields = ("username", "full_name", "phone_number", "password", "google_id", "avatar")

    def validate_password(self, value: str) -> str:
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAuthToken
        fields = ("access_token", "last_login")


class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = ("id", "name", "icon_url")


class CropVarietySerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source="crop.name", read_only=True)

    class Meta:
        model = CropVariety
        fields = ("id", "crop", "name", "is_primary", "crop_name")


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ("id", "name", "user")
        read_only_fields = ("user",)


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ("id", "name", "serial_number")


class FieldSerializer(serializers.ModelSerializer):
    soil_type_name = serializers.CharField(source="soil_type.name", read_only=True)
    farm_name = serializers.CharField(source="farm.name", read_only=True)
    crop_name = serializers.CharField(source="crop.name", read_only=True)
    crop_variety_name = serializers.CharField(source="crop_variety.name", read_only=True)
    irrigation_method_name = serializers.SerializerMethodField()
    size_acres = serializers.SerializerMethodField()
    current_sowing_date = serializers.SerializerMethodField()
    current_growth_start_date = serializers.SerializerMethodField()
    current_flowering_date = serializers.SerializerMethodField()
    current_harvesting_date = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = (
            "id",
            "name",
            "farm",
            "farm_name",
            "device",
            "crop",
            "crop_name",
            "crop_variety",
            "crop_variety_name",
            "user",
            "boundary",
            "location_name",
            "area",
            "soil_type",
            "soil_type_name",
            "image",
            "irrigation_method_name",
            "size_acres",
            "current_sowing_date",
            "current_growth_start_date",
            "current_flowering_date",
            "current_harvesting_date",
            "is_active",
            "is_locked",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("user", "created_at", "updated_at", "area")

    def get_irrigation_method_name(self, obj):
        try:
            fim = FieldIrrigationMethod.objects.filter(field=obj).select_related("irrigation_method").first()
            return getattr(getattr(fim, "irrigation_method", None), "name", None)
        except Exception:
            return None

    def _latest_lifecycle(self, obj):
        try:
            return CropLifecycleDates.objects.filter(field=obj).order_by("-id").first()
        except Exception:
            return None

    def get_current_sowing_date(self, obj):
        lcd = self._latest_lifecycle(obj)
        return getattr(lcd, "sowing_date", None)

    def get_current_growth_start_date(self, obj):
        lcd = self._latest_lifecycle(obj)
        return getattr(lcd, "growth_start_date", None)

    def get_current_flowering_date(self, obj):
        lcd = self._latest_lifecycle(obj)
        return getattr(lcd, "flowering_date", None)

    def get_current_harvesting_date(self, obj):
        lcd = self._latest_lifecycle(obj)
        return getattr(lcd, "harvesting_date", None)

    def get_size_acres(self, obj):
        try:
            hectares = (obj.area or {}).get("hectares")
            if isinstance(hectares, (int, float)):
                return round(float(hectares) * 2.47105, 4)
        except Exception:
            pass
        return None


class CropLifecycleDatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropLifecycleDates
        fields = ("id", "field", "sowing_date", "growth_start_date", "flowering_date", "harvesting_date", "yield_amount")


class FieldIrrigationMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldIrrigationMethod
        fields = ("id", "field", "irrigation_method")


class FieldIrrigationPracticeSerializer(serializers.ModelSerializer):
    field_name = serializers.CharField(source="field.name", read_only=True)
    method_name = serializers.CharField(source="irrigation_method.name", read_only=True)
    scheduled_time = serializers.DateTimeField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = FieldIrrigationPractice
        fields = ("id", "field", "field_name", "irrigation_method", "method_name", "notes", "performed_at", "scheduled_time")

    def create(self, validated_data):
        # Map scheduled_time to performed_at if provided
        scheduled = validated_data.pop("scheduled_time", None)
        if scheduled and not validated_data.get("performed_at"):
            validated_data["performed_at"] = scheduled
        return super().create(validated_data)


class SoilTextureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilTexture
        fields = ("id", "name", "icon")


class SoilReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilReport
        fields = (
            "id",
            "field",
            "ph",
            "ec",
            "nitrogen",
            "phosphorous",
            "potassium",
            "boron",
            "copper",
            "iron",
            "zinc",
            "manganese",
            "soil_type",
            "report_link",
        )


class IrrigationMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationMethods
        fields = ("id", "name")


class FeatureTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureType
        fields = ("id", "name", "description", "created_at", "updated_at")


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ("id", "name", "feature_type", "created_at", "updated_at")


class PlanSerializer(serializers.ModelSerializer):
    features = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = ("id", "name", "type", "price", "duration", "features")

    def get_features(self, obj):
        items = []
        try:
            for pf in obj.plan_features.select_related("feature").all():
                items.append(pf.feature.name)
        except Exception:
            pass
        return items


class UserPlanSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)

    class Meta:
        model = UserPlan
        fields = ("id", "user", "plan", "plan_name", "start_date", "end_date", "expire_at", "is_active")


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "sender", "receiver", "message", "is_read", "created_at")


class SupportRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = ("id", "user", "category", "description", "assigned_role", "created_at", "updated_at")
        read_only_fields = ("user", "assigned_role", "created_at", "updated_at")


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ("id", "file", "content_type", "object_id", "uploaded_at")


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ("id", "action", "description", "created_at", "object_id")


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ("id", "brand", "last4", "exp_month", "exp_year", "is_primary", "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")


class TransactionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Transaction
        fields = (
            "id",
            "user",
            "user_username",
            "plan",
            "plan_name",
            "amount",
            "currency",
            "status",
            "invoice_pdf",
            "created_at",
        )

